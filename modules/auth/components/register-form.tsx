'use client'

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Spinner } from "@/components/ui/spinner"
import { PhoneInput } from "@/components/ui/phone-input"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { signup } from "@/modules/auth/actions"
import { VerifyForm } from "./verify-form"

const registerSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type FormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
    onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<'register' | 'verify'>('register')
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)

        const formData = new FormData()
        formData.append("full_name", data.full_name)
        formData.append("email", data.email)
        formData.append("phone", data.phone)
        formData.append("password", data.password)

        try {
            const result = await signup(formData)

            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success("Account created successfully! Please verify your email.")
                setRegisteredEmail(data.email)
                setStep('verify')
            }
        } catch (err) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    if (step === 'verify' && registeredEmail) {
        return (
            <VerifyForm
                email={registeredEmail}
                onSuccess={() => {
                    toast.success("Email verified successfully!")
                    if (onSuccess) {
                        onSuccess()
                    } else {
                        router.push('/')
                    }
                }}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an Account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your details to generate your account
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                        id="full_name"
                        placeholder="John Doe"
                        {...register("full_name")}
                        className="h-11"
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
                        placeholder="Email"
                        {...register("email")}
                        className="h-11"
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
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
                                defaultCountryName="Turkey"
                            />
                        )}
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                        id="password"
                        {...register("password")}
                        className="h-11"
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <PasswordInput
                        id="confirmPassword"
                        {...register("confirmPassword")}
                        className="h-11"
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                    {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </div>
    )
}
