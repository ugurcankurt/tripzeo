'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBooking } from "@/modules/bookings/actions"
import { toast } from "sonner"
import { BookingRegisterForm } from "@/modules/bookings/components/booking-register-form"
import { ChevronDown, CheckCircle2, Loader2 } from "lucide-react"
import { useLocation } from "@/hooks/use-location"

import { User } from "@supabase/supabase-js"
import { Tables } from "@/types/supabase"

interface BookingConfirmationFormProps {
    experienceId?: string
    date?: string
    people?: number
    totalAmount?: number
    currentUser?: User | null
    userProfile?: Tables<'profiles'> | null
    duration?: number
    startTime?: string
    endTime?: string
    experienceTitle?: string
    experienceImage?: string
    hostId?: string
}

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BookingConfirmationForm({
    experienceId,
    date,
    people,
    currentUser,
    userProfile
}: BookingConfirmationFormProps) {
    // Location Hook
    const {
        countries,
        states,
        cities,
        selectedCountry,
        selectedState,
        selectedCity,
        handleCountryChange,
        handleStateChange,
        setSelectedCity,
        loadingCountries,
        loadingStates,
        loadingCities,
        hasStates
    } = useLocation({
        initialCountry: userProfile?.country || "",
        initialState: userProfile?.state || "",
        initialCity: userProfile?.city || ""
    })

    const [address, setAddress] = useState(userProfile?.address || "")
    const [zipCode, setZipCode] = useState(userProfile?.zip_code || "")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleCreateBooking = async () => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            if (experienceId) formData.append("experienceId", experienceId)
            if (date) formData.append("date", date)
            if (people) formData.append("guests", people.toString())

            // Append Address Info
            if (address) formData.append("address", address)
            if (selectedCity) formData.append("city", selectedCity)
            if (selectedCountry) formData.append("country", selectedCountry)
            if (selectedState) formData.append("state", selectedState)
            if (zipCode) formData.append("zipCode", zipCode)

            const result = await createBooking(null, formData)

            if (result.error) {
                toast.error(result.error)
            } else if (result.success && result.bookingId) {
                toast.success("Booking initialized!")
                router.push(`/payment/${result.bookingId}`)
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!currentUser) {
        return (
            <div className="space-y-6">
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6">
                    <h3 className="font-medium text-blue-900 mb-1">Create an account to continue</h3>
                    <p className="text-sm text-blue-700">
                        You need an account to manage your booking and communicate with the host.
                    </p>
                </div>

                {/* Booking Register Form handles the sign-up and verification flow with address info */}
                <BookingRegisterForm onSuccess={handleCreateBooking} />
            </div>
        )
    }

    // Check if we need to show address fields
    const showAddressFields = !userProfile?.address || !userProfile?.city || !userProfile?.country || !userProfile.zip_code

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="font-medium text-green-900">You are logged in</h3>
                    <p className="text-sm text-green-700">
                        Ready to confirm your booking as <strong>{currentUser.email}</strong>.
                    </p>
                </div>
            </div>

            {showAddressFields && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-medium">Billing Address & Identity Info</h3>

                    {/* Country & City (& State if applicable) Row */}
                    <div className={`grid gap-4 ${hasStates ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <div className="relative">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    onChange={handleCountryChange}
                                    value={selectedCountry || ''}
                                >
                                    <option value="">Select Country</option>
                                    {loadingCountries ? <option disabled>Loading...</option> : countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>

                        {hasStates && (
                            <div className="space-y-2">
                                <Label>State</Label>
                                <div className="relative">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        onChange={handleStateChange}
                                        value={selectedState}
                                        disabled={loadingStates}
                                    >
                                        <option value="">Select State</option>
                                        {loadingStates ? <option disabled>Loading...</option> : states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>City</Label>
                            <div className="relative">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    disabled={!selectedCountry || loadingCities}
                                    value={selectedCity || ''}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                >
                                    <option value="">Select City</option>
                                    {loadingCities ? <option disabled>Loading...</option> : cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Address</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            placeholder="Your full address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Zip Code</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                placeholder="34000"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            <Button
                className="w-full text-lg h-14"
                size="lg"
                onClick={handleCreateBooking}
                disabled={isLoading || (showAddressFields && (!address || !selectedCity || !selectedCountry || !zipCode))}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    "Proceed to Payment"
                )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
                By clicking the button, you agree to the cancellation policy and terms.
            </p>
        </div>
    )
}
