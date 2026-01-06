'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelBooking } from "@/modules/bookings/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ReviewForm } from "@/modules/reviews/components/review-form"
import { Star } from "lucide-react"

import { Database } from "@/types/supabase"

export function OrderActions({ bookingId, status, hasReviewed = false, bookingDate, startTime }: {
    bookingId: string
    status: Database['public']['Enums']['booking_status'] | string
    hasReviewed?: boolean
    bookingDate: string
    startTime: string | null
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [reviewOpen, setReviewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Calculate cancellation eligibility
    // Calculate cancellation eligibility
    const canCancel = () => {
        try {
            if (!bookingDate) return true // Should not happen, but safe default

            // Handle date parsing safely. bookingDate is likely YYYY-MM-DD or ISO
            let targetDate = new Date(bookingDate)

            // If it's pure date string (YYYY-MM-DD), Date() parses as UTC. 
            // We need to be careful. Ideally we combine string before parsing.
            if (startTime) {
                // Assuming startTime is "HH:MM:SS"
                const [h, m] = startTime.split(':')
                // Reset to that time on the target date. 
                // Note: This relies on browser's local timezone interpretation use setHours if basic Date(YYYY-MM-DD) was UTC
                // Better approach: string concat if standard format YYYY-MM-DD
                const datePart = bookingDate.split('T')[0] // Ensure we get YYYY-MM-DD
                const finalStr = `${datePart}T${h}:${m}:00`
                const TEST_DATE = new Date(finalStr)

                // If valid date from string concat, use it (browser parses ISO-like usually as Local or UTC depending on browser, but typically local if no Z)
                // But simplest is manual setHours on a date object created from YMD

                if (!isNaN(TEST_DATE.getTime())) {
                    targetDate = TEST_DATE
                } else {
                    // Fallback manual manipulation
                    targetDate.setHours(Number(h), Number(m), 0, 0)
                }
            }

            const now = new Date()
            const diffInHours = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60)

            // If diffInHours is negative (past) or less than 24, we block cancellation
            return diffInHours >= 24
        } catch (e) {
            console.error("Date parse error", e)
            return false // Default to blocking if unsure to avoid system gaming
        }
    }

    const showCancelButton = canCancel()

    const handleCancel = async (e: React.MouseEvent) => {
        e.preventDefault() // Otomatik kapanmayı engelle
        setLoading(true)

        try {
            const result = await cancelBooking(bookingId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.success)
                setOpen(false) // Close when done
                router.refresh()
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (status === 'cancelled_by_user' || status === 'cancelled_by_host') {
        return null
    }

    if ((status === 'completed' || status === 'paid_out') && !hasReviewed) {
        return (
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                        <Star className="h-4 w-4 mr-2" />
                        Leave Review
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rate Your Experience</DialogTitle>
                        <DialogDescription>
                            How was your experience? Your feedback helps others.
                        </DialogDescription>
                    </DialogHeader>
                    <ReviewForm bookingId={bookingId} reviewType="host_review" onSuccess={() => {
                        setReviewOpen(false)
                        router.refresh()
                    }} />
                </DialogContent>
            </Dialog>
        )
    }

    // Disable cancel for completed/paid out bookings if they already reviewed (or if logic falls through)
    if (status === 'completed' || status === 'paid_out') {
        return null
    }

    if (!showCancelButton) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-muted-foreground cursor-not-allowed"
                disabled
                title="Cancellation not allowed within 24 hours of start time"
            >
                Non-refundable
            </Button>
        )
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="ml-2">Cancel</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Go Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} disabled={loading} className="bg-red-600 hover:bg-red-700">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Cancel Booking
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
