'use client'

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Loader2, User } from "lucide-react"
import { getGuestReviews } from "@/modules/reviews/actions"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GuestReviewDialogProps {
    guestId: string
    bookingId?: string
    guestName?: string
    children: React.ReactNode
}

export function GuestReviewDialog({ guestId, bookingId, guestName, children }: GuestReviewDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [reviews, setReviews] = useState<any[]>([])

    useEffect(() => {
        if (open) {
            setLoading(true)
            getGuestReviews(guestId, bookingId)
                .then((result) => {
                    if (result.reviews) {
                        setReviews(result.reviews)
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [open, guestId])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild className="cursor-pointer hover:opacity-80 transition-opacity">
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Reviews for {guestName || 'Guest'}
                    </DialogTitle>
                    <DialogDescription>
                        See what other hosts have said about this guest.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-8 bg-muted/20 rounded-lg">
                            <p className="text-muted-foreground text-sm">No reviews found for this guest.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-4 border rounded-lg bg-card shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={review.reviewer?.avatar_url} />
                                                <AvatarFallback>{review.reviewer?.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">{review.reviewer?.full_name}</h4>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    Host of: {review.booking?.experience?.title}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{review.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        <div className="mt-2 text-xs text-muted-foreground text-right border-t pt-2">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
