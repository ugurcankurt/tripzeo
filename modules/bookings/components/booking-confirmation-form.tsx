'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBooking } from "@/modules/bookings/actions"
import { toast } from "sonner"
import { BookingRegisterForm } from "@/modules/bookings/components/booking-register-form"
import { CheckCircle2, Loader2 } from "lucide-react"

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
    const [addressData, setAddressData] = useState({
        address: userProfile?.address || "",
        city: userProfile?.city || "",
        country: userProfile?.country || "",
        zipCode: userProfile?.zip_code || "",
    })
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
            if (addressData.address) formData.append("address", addressData.address)
            if (addressData.city) formData.append("city", addressData.city)
            if (addressData.country) formData.append("country", addressData.country)
            if (addressData.zipCode) formData.append("zipCode", addressData.zipCode)
            if (addressData.zipCode) formData.append("zipCode", addressData.zipCode)

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
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Address</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            placeholder="Your full address"
                            value={addressData.address}
                            onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                placeholder="Istanbul"
                                value={addressData.city}
                                onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Zip Code</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                placeholder="34000"
                                value={addressData.zipCode}
                                onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Country</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                placeholder="Turkey"
                                value={addressData.country}
                                onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    {/* TCK Input removed as it is now hardcoded for Iyzipay */}
                </div>
            )}

            <Button
                className="w-full text-lg h-14"
                size="lg"
                onClick={handleCreateBooking}
                disabled={isLoading || (showAddressFields && (!addressData.address || !addressData.city || !addressData.country))}
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
