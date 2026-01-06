'use client'

import { useActionState, useState, useEffect } from "react"
import { toast } from "sonner"
import { updateProfile, initiateEmailChange, verifyEmailChange } from "@/modules/auth/actions"
import { createClient } from "@/lib/supabase/client"
import { compressImage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneInput } from "@/components/ui/phone-input"
import { MapPin, Pencil } from "lucide-react"
import { useLocation } from "@/hooks/use-location"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"

const initialState = {
    message: '',
    error: '',
    success: '',
} as any

import { Tables } from "@/types/supabase"

interface ProfileFormProps {
    profile: Tables<'profiles'> | null
    userEmail?: string
    categories: Pick<Tables<'categories'>, 'id' | 'name'>[]
}

export function ProfileForm({ profile, userEmail, categories }: ProfileFormProps) {
    const [state, formAction, isPending] = useActionState(updateProfile, initialState)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
    const [selectedCategory, setSelectedCategory] = useState<string>(profile?.category_id || "")
    const [phone, setPhone] = useState(profile?.phone || '')
    const supabase = createClient()

    // Email Change State
    const [isChangingEmail, setIsChangingEmail] = useState(false)
    const [emailStep, setEmailStep] = useState<'input' | 'otp'>('input')
    const [newEmail, setNewEmail] = useState('')
    const [emailOtp, setEmailOtp] = useState('')
    const [loadingEmail, setLoadingEmail] = useState(false)

    // Bank Region State
    const [selectedBankRegion, setSelectedBankRegion] = useState<string>(profile?.bank_country || 'TR')

    // Location Logic via Hook
    const {
        countries,
        states,
        cities,
        selectedCountry,
        selectedState,
        selectedCity,
        handleCountryChange,
        handleStateChange,
        loadingCountries,
        loadingStates,
        loadingCities,
        hasStates,
        setSelectedCity
    } = useLocation({
        initialCountry: profile?.country,
        initialState: profile?.state,
        initialCity: profile?.city
    })

    useEffect(() => {
        if (state?.success) {
            toast.success(state.success)
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    const handleInitiateEmailChange = async () => {
        setLoadingEmail(true)
        try {
            const result = await initiateEmailChange(newEmail)
            if (result.error) {
                toast.error(result.error)
            } else {
                setEmailStep('otp')
                toast.success('Verification code sent to your NEW email.')
            }
        } catch (error) {
            toast.error('Failed to send code.')
        } finally {
            setLoadingEmail(false)
        }
    }

    const handleVerifyEmailChange = async () => {
        if (emailOtp.length !== 6) return
        setLoadingEmail(true)
        try {
            const result = await verifyEmailChange(newEmail, emailOtp)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Email updated successfully!')
                setIsChangingEmail(false)
                setEmailStep('input')
                setNewEmail('')
                setEmailOtp('')
                // Ideally refresh the page or update local user email state
                window.location.reload()
            }
        } catch (error) {
            toast.error('Failed to verify code.')
        } finally {
            setLoadingEmail(false)
        }
    }

    // Phone Verification State - DISABLED
    // const [otpSent, setOtpSent] = useState(false)
    // const [isVerifying, setIsVerifying] = useState(false)
    // const [otpCode, setOtpCode] = useState('')
    // const [loadingAuth, setLoadingAuth] = useState(false)

    // Import actions dynamically or use from import
    // const { initiatePhoneUpdate, verifyPhoneUpdate } = require("@/modules/auth/actions")

    // const handleSendPhoneOtp = async () => { ... }
    // const handleVerifyPhoneUpdate = async () => { ... }



    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Please select a photo.')
            }

            const originalFile = event.target.files[0]

            // Compress Image
            const compressedBlob = await compressImage(originalFile)
            const file = new File([compressedBlob], 'avatar.webp', { type: 'image/webp' })

            // Generate unique filename
            const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false // New file every time
                })

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

            setAvatarUrl(publicUrl)

            toast.success('Profile photo updated! Don\'t forget to save.')

        } catch (error: any) {
            console.error(error)
            toast.error('Upload error: ' + (error.message || 'Unknown error'))
        } finally {
            setUploading(false)
        }
    }

    return (
        <form action={formAction}>
            {/* Hidden input to send avatar URL to server action */}
            <input type="hidden" name="avatarUrl" value={avatarUrl || ''} />
            <input type="hidden" name="phone" value={phone} />

            <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || ''} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="relative">
                    <Button variant="outline" size="sm" type="button" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                    />
                </div>
            </div>
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                            name="fullName"
                            defaultValue={profile?.full_name || ''}
                            placeholder="Your Full Name"
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">Full name matches your account details and cannot be changed.</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Email</Label>
                            {!isChangingEmail && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                                    onClick={() => setIsChangingEmail(true)}
                                >
                                    <Pencil className="mr-1 h-3 w-3" /> Change
                                </Button>
                            )}
                        </div>

                        {!isChangingEmail ? (
                            <>
                                <Input
                                    name="email"
                                    defaultValue={userEmail || profile?.email || ''}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">Email address cannot be changed directly.</p>
                            </>
                        ) : (
                            <div className="rounded-md border p-4 space-y-4 bg-muted/30">
                                {emailStep === 'input' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="newEmail">New Email Address</Label>
                                            <Input
                                                id="newEmail"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="new@example.com"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                onClick={handleInitiateEmailChange}
                                                disabled={loadingEmail || !newEmail}
                                                size="sm"
                                            >
                                                {loadingEmail ? 'Sending...' : 'Send Code'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setIsChangingEmail(false)
                                                    setNewEmail('')
                                                }}
                                                size="sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Verify Code sent to {newEmail}</Label>
                                            <InputOTP
                                                maxLength={6}
                                                value={emailOtp}
                                                onChange={(value) => setEmailOtp(value)}
                                            >
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                </InputOTPGroup>
                                                <InputOTPSeparator />
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                onClick={handleVerifyEmailChange}
                                                disabled={loadingEmail || emailOtp.length !== 6}
                                                size="sm"
                                            >
                                                {loadingEmail ? 'Verifying...' : 'Verify & Change'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setEmailStep('input')}
                                                size="sm"
                                            >
                                                Back
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <PhoneInput
                                        value={phone}
                                        onChange={(val: string) => {
                                            setPhone(val)
                                        }}
                                        defaultCountryName={profile?.country}
                                    />
                                </div>
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Make sure to include your country code.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                        name="bio"
                        defaultValue={profile?.bio || ''}
                        placeholder="Tell us about yourself. If you want to be a host, describe your skills."
                        className="h-32"
                    />
                </div>

                <div className="space-y-4 pt-4 border-t">
                    {(profile?.role === 'host' || profile?.role === 'admin') && (
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Service Details
                            </h3>
                            <div className="space-y-2">
                                <Label>Service Category *</Label>
                                <select
                                    name="categoryId"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    required={profile?.role === 'host'}
                                    disabled={!!profile?.category_id}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    {profile?.category_id
                                        ? "Category cannot be changed once set. Contact support for changes."
                                        : "This determines the type of experiences you can offer."}
                                </p>
                            </div>
                        </div>
                    )}

                    <h3 className="font-medium flex items-center gap-2 pt-2">
                        <MapPin className="h-4 w-4" /> Address Locations
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onChange={handleCountryChange}
                                value={selectedCountry || ''}
                                name="country"
                            >
                                <option value="">Select Country</option>
                                {loadingCountries ? <option disabled>Loading...</option> : countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {hasStates && (
                            <div className="space-y-2">
                                <Label>State</Label>
                                <select
                                    name="state" // Note: This might not be saved to DB if column missing, but needed for UX
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    onChange={handleStateChange}
                                    value={selectedState}
                                    disabled={loadingStates}
                                >
                                    <option value="">Select State</option>
                                    {loadingStates ? <option disabled>Loading...</option> : states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>City</Label>
                            <select
                                name="city"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                disabled={!selectedCountry || loadingCities}
                                value={selectedCity || ''}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            >
                                <option value="">Select City</option>
                                {loadingCities ? <option disabled>Loading...</option> : cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                name="address"
                                defaultValue={profile?.address || ''}
                                placeholder="Street, Apt, etc."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Zip Code</Label>
                            <Input
                                name="zipCode"
                                defaultValue={profile?.zip_code || ''}
                                placeholder="Zip Code"
                            />
                        </div>
                    </div>
                </div>

                {(profile?.role === 'host' || profile?.role === 'admin') && (
                    <div className="pt-4 border-t space-y-4">
                        <h3 className="font-medium">Bank Details for Payouts</h3>
                        <p className="text-sm text-muted-foreground">Select where your bank account is located to see the required fields. For Wise payouts, use your local bank details.</p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Bank Country / Region</Label>
                                <select
                                    name="bankCountry"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedBankRegion}
                                    onChange={(e) => setSelectedBankRegion(e.target.value)}
                                >
                                    <option value="TR">Turkey (IBAN)</option>
                                    <option value="EU">Europe (SEPA - IBAN)</option>
                                    <option value="US">United States (USD - Routing/Account)</option>
                                    <option value="OTHER">Other (International)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Account Holder Name</Label>
                                <Input
                                    name="accountHolder"
                                    defaultValue={profile?.account_holder || ''}
                                    placeholder="Full Legal Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input
                                    name="bankName"
                                    defaultValue={profile?.bank_name || ''}
                                    placeholder={selectedBankRegion === 'US' ? "e.g. Chase, Wells Fargo" : "e.g. Ziraat, Garanti, Wise"}
                                    required
                                />
                            </div>
                        </div>

                        {(selectedBankRegion === 'TR' || selectedBankRegion === 'EU' || selectedBankRegion === 'OTHER') && (
                            <div className="grid gap-4 md:grid-cols-2 bg-muted/30 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
                                <div className="col-span-2">
                                    <p className="text-sm font-semibold mb-2">
                                        {selectedBankRegion === 'TR' ? 'Turkey (TL Account)' : 'Europe / International (Euro Account)'}
                                    </p>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>IBAN</Label>
                                    <Input
                                        name="iban"
                                        defaultValue={profile?.iban || ''}
                                        placeholder={selectedBankRegion === 'TR' ? "TR..." : "DE..."}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>BIC / SWIFT Code {selectedBankRegion === 'EU' ? '(Optional)' : ''}</Label>
                                    <Input
                                        name="bankCode"
                                        defaultValue={profile?.bank_code || ''}
                                        placeholder="BANKTR..."
                                    />
                                </div>
                            </div>
                        )}

                        {selectedBankRegion === 'US' && (
                            <div className="grid gap-4 md:grid-cols-2 bg-muted/30 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
                                <div className="col-span-2">
                                    <p className="text-sm font-semibold mb-2">United States (USD Account)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Routing Number (ACH / ABA)</Label>
                                    <Input
                                        name="routingNumber"
                                        defaultValue={profile?.routing_number || ''}
                                        placeholder="9 Digit Routing Number"
                                        maxLength={9}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input
                                        name="accountNumber"
                                        defaultValue={profile?.account_number || ''}
                                        placeholder="Account Number"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}
