
import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/types/supabase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminReviewActions } from "@/modules/admin/components/review-actions"
import { Star } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"

export default async function AdminReviewsPage() {
    const supabase = await createClient()

    type ReviewWithRelations = Tables<'reviews'> & {
        reviewer: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url' | 'email'> | null
        reviewee: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url' | 'email'> | null
        booking: {
            experience: Pick<Tables<'experiences'>, 'title'> | null
        } | null
    }

    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            *,
            reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url, email),
            reviewee:profiles!reviews_reviewee_id_fkey(full_name, avatar_url, email),
            booking:bookings(
                experience:experiences(title)
            )
        `)
        .order('created_at', { ascending: false })
        .returns<ReviewWithRelations[]>()

    return (
        <div className="space-y-6">
            <AdminPageHeader heading="Review Management" text="Manage all reviews submitted on the platform.">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1">
                        Total: {reviews?.length || 0}
                    </Badge>
                </div>
            </AdminPageHeader>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reviewer</TableHead>
                            <TableHead>Reviewee</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-[300px]">Comment</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews?.map((review) => (
                            <TableRow key={review.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.reviewer?.avatar_url || ''} />
                                            <AvatarFallback>{review.reviewer?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{review.reviewer?.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{review.reviewer?.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.reviewee?.avatar_url || ''} />
                                            <AvatarFallback>{review.reviewee?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{review.reviewee?.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{review.reviewee?.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-sm line-clamp-1 max-w-[150px]" title={review.booking?.experience?.title || ''}>
                                        {review.booking?.experience?.title || '-'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-0.5">
                                        {review.rating}
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground line-clamp-2" title={review.comment || ''}>
                                        {review.comment || ''}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {review.type === 'host_review' ? 'Review to Host' : 'Review to Guest'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <AdminReviewActions reviewId={review.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
