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

export function OrderActions({ bookingId, status, hasReviewed = false }: {
    bookingId: string,
    status: Database['public']['Enums']['booking_status'] | string,
    hasReviewed?: boolean
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [reviewOpen, setReviewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

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
