'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { forgotPassword, verifyRecoveryOtp, resetPassword } from "@/modules/auth/actions"

// Schema for Step 1: Email
const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
})

// Schema for Step 2: OTP
const otpSchema = z.object({
    code: z.string().min(6, "Verification code must be 6 digits"),
})

// Schema for Step 3: Reset Password
const resetSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type EmailData = z.infer<typeof emailSchema>
type OtpData = z.infer<typeof otpSchema>
type ResetData = z.infer<typeof resetSchema>

type Step = 'email' | 'otp' | 'reset'

export function ForgotPasswordForm() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

    // Forms
    const emailForm = useForm<EmailData>({ resolver: zodResolver(emailSchema) })
    const otpForm = useForm<OtpData>({ resolver: zodResolver(otpSchema) })
    const resetForm = useForm<ResetData>({ resolver: zodResolver(resetSchema) })

    // Step 1: Send Email
    const onEmailSubmit = async (data: EmailData) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("email", data.email)

            const result = await forgotPassword(formData)
            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                setEmail(data.email)
                setStep('otp')
                toast.success("Code sent! Check your email.")
            }
        } catch (err) {
            toast.error("Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Verify OTP
    const onOtpSubmit = async (data: OtpData) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("email", email)
            formData.append("code", data.code)

            const result = await verifyRecoveryOtp(formData)
            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success("Code verified!")
                setStep('reset')
            }
        } catch (err) {
            toast.error("Invalid code.")
        } finally {
            setIsLoading(false)
        }
    }

    // Step 3: Reset Password
    const onResetSubmit = async (data: ResetData) => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("password", data.password)

            const result = await resetPassword(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Password reset successfully!")
                router.push('/login')
            }
        } catch (err) {
            toast.error("Failed to reset password.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>
                    {step === 'email' && "Forgot Password"}
                    {step === 'otp' && "Verify Code"}
                    {step === 'reset' && "Reset Password"}
                </CardTitle>
                <CardDescription>
                    {step === 'email' && "Enter your email to receive a verification code."}
                    {step === 'otp' && `Enter the code sent to ${email}`}
                    {step === 'reset' && "Enter your new password."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Step 1 Form */}
                {step === 'email' && (
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email"
                                {...emailForm.register("email")}
                            />
                            {emailForm.formState.errors.email && (
                                <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Send Code
                        </Button>
                    </form>
                )}

                {/* Step 2 Form */}
                {step === 'otp' && (
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otpForm.watch("code")}
                                onChange={(val: string) => otpForm.setValue("code", val)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {otpForm.formState.errors.code && (
                            <p className="text-sm text-center text-red-500">{otpForm.formState.errors.code.message}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Verify
                        </Button>
                    </form>
                )}

                {/* Step 3 Form */}
                {step === 'reset' && (
                    <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...resetForm.register("password")}
                            />
                            {resetForm.formState.errors.password && (
                                <p className="text-sm text-red-500">{resetForm.formState.errors.password.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...resetForm.register("confirmPassword")}
                            />
                            {resetForm.formState.errors.confirmPassword && (
                                <p className="text-sm text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Reset Password
                        </Button>
                    </form>
                )}
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                    Back to Sign In
                </Link>
            </CardFooter>
        </Card>
    )
}
