'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, X, Ban, RefreshCcw, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { approveBooking, rejectBooking, cancelBooking, refundBooking, completeBooking } from "@/modules/bookings/actions"

import { Tables } from "@/types/supabase"

interface AdminBookingActionsProps {
    booking: Tables<'bookings'>
}

export function AdminBookingActions({ booking }: AdminBookingActionsProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleAction = async (actionFn: (id: string) => Promise<any>, successMessage: string) => {
        setIsLoading(true)
        try {
            const result = await actionFn(booking.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(successMessage || result.success)
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (!booking) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                    <span className="sr-only">Open menu</span>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Pending Actions */}
                {(booking.status === 'pending_payment' || booking.status === 'pending_host_approval') && (
                    <>
                        <DropdownMenuItem onClick={() => handleAction(approveBooking, "Booking approved")}>
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                            Approve Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(rejectBooking, "Booking rejected")}>
                            <X className="mr-2 h-4 w-4 text-red-600" />
                            Reject Booking
                        </DropdownMenuItem>
                    </>
                )}

                {/* Confirmed Actions */}
                {booking.status === 'confirmed' && (
                    <>
                        <DropdownMenuItem onClick={() => handleAction(cancelBooking, "Booking cancelled")}>
                            <Ban className="mr-2 h-4 w-4 text-orange-600" />
                            Cancel Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(refundBooking, "Booking refunded")}>
                            <RefreshCcw className="mr-2 h-4 w-4 text-blue-600" />
                            Refund Payment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction(completeBooking, "Booking marked as completed")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Mark as Completed
                        </DropdownMenuItem>
                    </>
                )}

                {/* Completed/Cancelled - View Only or Archives (No actions for now) */}
                {['completed', 'cancelled', 'cancelled_by_host', 'cancelled_by_user', 'rejected'].includes(booking.status || '') && (
                    <DropdownMenuItem disabled>
                        No actions available
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
