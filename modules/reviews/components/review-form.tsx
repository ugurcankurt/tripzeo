'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { createReview } from "@/modules/reviews/actions"
import { toast } from "sonner"
import { useFormStatus } from "react-dom"

interface ReviewFormProps {
    bookingId: string
    reviewType: string // 'host_review' | 'user_review'
    onSuccess?: () => void
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Review
        </Button>
    )
}

export function ReviewForm({ bookingId, reviewType, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)

    const handleSubmit = async (formData: FormData) => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        formData.set('rating', rating.toString())
        formData.set('bookingId', bookingId)
        formData.set('reviewType', reviewType)

        const result = await createReview(null, formData)

        if (result?.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success("Review submitted successfully!")
            if (onSuccess) onSuccess()
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`h-6 w-6 transition-colors ${star <= (hoverRating || rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">Comment</label>
                <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Share your experience..."
                    required
                    className="min-h-[100px]"
                />
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    )
}
