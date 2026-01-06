"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { ReviewData } from "@/types/experiences"
import { format } from "date-fns"


interface ReviewListProps {
    experienceId: string
    initialReviews?: ReviewData[]
}

export function ReviewList({ experienceId, initialReviews = [] }: ReviewListProps) {
    const reviews = initialReviews

    if (reviews.length === 0) {
        return (
            <div className="text-muted-foreground text-sm py-4">
                No reviews yet for this experience.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={review.reviewer?.avatar_url || ''} alt={review.reviewer?.full_name || 'User'} />
                        <AvatarFallback>{review.reviewer?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{review.reviewer?.full_name || 'Anonymous User'}</h4>
                            <span className="text-muted-foreground text-xs">
                                {format(new Date(review.created_at), "MMMM d, yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < (review.rating || 0) ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`}
                                />
                            ))}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                            {review.comment}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
