'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { login } from "@/modules/auth/actions"
import { sendEvent } from "@/lib/analytics"

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

type FormData = z.infer<typeof loginSchema>

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)

        const formData = new FormData()
        formData.append("email", data.email)
        formData.append("password", data.password)

        try {
            const result = await login(formData)
            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                sendEvent('login', { method: 'email' })
                toast.success("Login successful!")
                router.refresh()
                router.push('/')
            }
        } catch (err) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email to sign in to your account
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                            Forgot password?
                        </Link>
                    </div>
                    <PasswordInput
                        id="password"
                        {...register("password")}
                        className="h-11"
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                    {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            {/* OAuth Buttons would go here */}
            {/* 
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" disabled={isLoading}>
                    Google
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                    GitHub
                </Button>
            </div>
            */}

            <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>
        </div>
    )
}
