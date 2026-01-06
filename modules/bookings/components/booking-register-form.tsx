'use client'

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Spinner } from "@/components/ui/spinner"
import { PhoneInput } from "@/components/ui/phone-input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createAutoUser } from "@/modules/auth/actions"
import { useLocation } from "@/hooks/use-location"

const registerSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string().min(2, "Zip Code is required"),
})

type FormData = z.infer<typeof registerSchema>

interface BookingRegisterFormProps {
    onSuccess?: () => void
}

export function BookingRegisterForm({ onSuccess }: BookingRegisterFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

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
        initialCountry: "",
        initialState: "",
        initialCity: ""
    })

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    })

    // Sync hook state with form
    const onCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleCountryChange(e)
        setValue("country", e.target.value)
    }

    const onStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleStateChange(e)
        setValue("state", e.target.value)
    }

    const onCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(e.target.value)
        setValue("city", e.target.value)
    }

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)

        const formData = new FormData()
        formData.append("full_name", data.full_name)
        formData.append("email", data.email)
        formData.append("phone", data.phone)

        // Append address info
        formData.append("address", data.address)
        formData.append("city", data.city)
        if (data.state) formData.append("state", data.state)
        formData.append("country", data.country)
        formData.append("zipCode", data.zipCode)

        try {
            const result = await createAutoUser(formData)

            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success("Account created successfully! Proceeding to payment...")
                if (onSuccess) {
                    onSuccess()
                } else {
                    router.refresh()
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="p-4">
                <CardTitle className="text-lg">New User Registration</CardTitle>
                <CardDescription>Fill in your details to create an account and book immediately.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                placeholder="John Doe"
                                {...register("full_name")}
                            />
                            {errors.full_name && (
                                <p className="text-sm text-red-500">{errors.full_name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Controller
                            control={control}
                            name="phone"
                            render={({ field }) => (
                                <PhoneInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    defaultCountryName="United States"
                                    className="w-full"
                                />
                            )}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-500">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Country & City (& State if applicable) Row */}
                    <div className={`grid gap-4 ${hasStates ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <div className="relative">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    onChange={onCountrySelect}
                                    value={selectedCountry || ''}
                                >
                                    <option value="">Select Country</option>
                                    {loadingCountries ? <option disabled>Loading...</option> : countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                            <input type="hidden" {...register("country")} value={selectedCountry || ''} />
                            {errors.country && (
                                <p className="text-sm text-red-500">{errors.country.message}</p>
                            )}
                        </div>

                        {hasStates && (
                            <div className="space-y-2">
                                <Label>State</Label>
                                <div className="relative">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        onChange={onStateSelect}
                                        value={selectedState}
                                        disabled={loadingStates}
                                    >
                                        <option value="">Select State</option>
                                        {loadingStates ? <option disabled>Loading...</option> : states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                                <input type="hidden" {...register("state")} value={selectedState || ''} />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>City</Label>
                            <div className="relative">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    disabled={!selectedCountry || loadingCities}
                                    value={selectedCity || ''}
                                    onChange={onCitySelect}
                                >
                                    <option value="">Select City</option>
                                    {loadingCities ? <option disabled>Loading...</option> : cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                            <input type="hidden" {...register("city")} value={selectedCity || ''} />
                            {errors.city && (
                                <p className="text-sm text-red-500">{errors.city.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Full Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Input
                            id="address"
                            placeholder="Street, Apt, etc."
                            {...register("address")}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">{errors.address.message}</p>
                        )}
                    </div>

                    {/* Zip Code Only */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input
                                id="zipCode"
                                placeholder="34000"
                                {...register("zipCode")}
                            />
                            {errors.zipCode && (
                                <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full text-lg h-12 mt-2" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account & Continue
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground p-4">
                <div>
                    We will create an account and send you a password setup link.
                </div>
            </CardFooter>
        </Card>
    )
}
