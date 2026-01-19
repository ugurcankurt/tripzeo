'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Spinner } from "@/components/ui/spinner"
import { useSearchParams, useRouter } from "next/navigation"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { verifyOtp } from "@/modules/auth/actions"

const verifySchema = z.object({
    code: z.string().min(6, "Verification code must be 6 digits"),
})

type FormData = z.infer<typeof verifySchema>

interface VerifyFormProps {
    email?: string
    onSuccess?: () => void
}

export function VerifyForm({ email: propEmail, onSuccess }: VerifyFormProps = {}) {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Use prop email if available, otherwise fallback to search params
    const email = propEmail || searchParams.get("email")

    const [isLoading, setIsLoading] = useState(false)

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: "",
        },
    })

    const code = watch("code")

    const onSubmit = async (data: FormData) => {
        if (!email) {
            toast.error("Email is missing. Please sign up again.")
            return
        }

        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append("email", email)
            formData.append("code", data.code)

            const result = await verifyOtp(formData)

            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success("Verification successful!")
                if (onSuccess) {
                    onSuccess()
                } else {
                    router.push('/')
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Verify Your Account</CardTitle>
                <CardDescription>
                    Enter the 6-digit code sent to {email ? <span className="font-medium">{email}</span> : "your email"}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={(value: string) => setValue("code", value)}
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
                    {errors.code && (
                        <p className="text-sm text-center text-red-500">{errors.code.message}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading || code.length < 6}>
                        {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Verify
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
