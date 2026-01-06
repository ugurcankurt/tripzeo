'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { requestHostAccess } from "@/modules/auth/actions"
import { toast } from "sonner"

export function BecomeHostButton() {
    const [isPending, startTransition] = useTransition()

    const handleRequest = () => {
        startTransition(async () => {
            try {
                const result = await requestHostAccess()
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Application submitted! We'll allow you in soon.")
                }
            } catch (error) {
                toast.error("Something went wrong.")
            }
        })
    }

    return (
        <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-full"
            onClick={handleRequest}
            disabled={isPending}
        >
            {isPending ? "Submitting..." : "Start Hosting & Earn 🚀"}
        </Button>
    )
}
