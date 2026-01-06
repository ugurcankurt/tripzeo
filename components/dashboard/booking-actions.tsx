"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, X, Loader2, Undo2, Star } from "lucide-react"
import { approveBooking, rejectBooking, refundBooking } from "@/modules/bookings/actions"
import { ReviewForm } from "@/modules/reviews/components/review-form"
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

interface BookingActionsProps {
    bookingId: string
    status: string
    hasReviewed?: boolean
}

export function BookingActions({ bookingId, status, hasReviewed = false }: BookingActionsProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            const result = await approveBooking(bookingId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Booking approved successfully!")
            }
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        setIsLoading(true)
        try {
            const result = await rejectBooking(bookingId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Booking rejected successfully.")
            }
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefund = async () => {
        setIsLoading(true)
        try {
            const result = await refundBooking(bookingId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Booking refunded successfully.")
            }
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {status === 'confirmed' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Refund</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently refund the booking transaction
                                and invalidates the booking for the user.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRefund} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Refund Booking
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {status === 'pending_host_approval' && (
                <>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleApprove}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">Approve</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        <span className="ml-2 hidden sm:inline">Reject</span>
                    </Button>
                </>
            )}

            {(status === 'completed' || status === 'paid_out') && !hasReviewed && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Star className="h-4 w-4 mr-2" />
                            Review Guest
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Review Guest</DialogTitle>
                            <DialogDescription>
                                Share your experience with this guest. This review will be visible on their profile.
                            </DialogDescription>
                        </DialogHeader>
                        <ReviewForm bookingId={bookingId} reviewType="user_review" />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
