import { createClient } from "@/lib/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Mail, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookingActions } from "@/components/dashboard/booking-actions"
import { GuestReviewDialog } from "@/components/dashboard/guest-review-dialog"
import { BookingTimeInfo } from "@/modules/bookings/components/booking-time-info"
import { BookingStatusBadge } from "@/modules/bookings/components/booking-status-badge"
import { requireHost } from "@/lib/auth/guards"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Tables } from "@/types/supabase"

type VendorBookingData = Tables<'bookings'> & {
    experience: Pick<Tables<'experiences'>, 'title' | 'images'> | null
    guest: Pick<Tables<'profiles'>, 'full_name' | 'email' | 'avatar_url'> | null
    reviews: Pick<Tables<'reviews'>, 'reviewer_id'>[]
}

export default async function VendorBookingsPage() {
    let user, profile

    try {
        const result = await requireHost()
        user = result.user
        profile = result.profile
    } catch (error: unknown) {
        // Safe check for error object
        const isHostError = error && typeof error === 'object' && 'message' in error && error.message === 'HOST_ACCESS_REQUIRED';

        if (isHostError) {
            return (
                <ErrorState
                    title="Unauthorized Access"
                    message="You must have a Host (Vendor) account to view this page."
                    action={{
                        label: "Go to Dashboard",
                        href: "/"
                    }}
                />
            )
        }
        throw error
    }

    const supabase = await createClient()

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
        *,
        experience:experiences(title, images),
        guest:profiles!user_id(full_name, email, avatar_url),
        reviews(reviewer_id)
    `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .returns<VendorBookingData[]>()

    if (!bookings || bookings.length === 0) {
        return (
            <EmptyState
                title="No bookings yet"
                description="You haven't received any bookings yet."
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Incoming Orders</h2>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1">
                        Total: {bookings?.length || 0}
                    </Badge>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>People</TableHead>
                            <TableHead>Earnings</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings?.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>
                                    <GuestReviewDialog guestId={booking.user_id} bookingId={booking.id} guestName={booking.guest?.full_name || undefined}>
                                        <div className="flex items-center gap-3 hover:bg-muted/50 p-1 rounded-md transition-colors cursor-pointer" title="Click to view reviews">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={booking.guest?.avatar_url || ''} />
                                                <AvatarFallback>
                                                    {booking.guest?.full_name?.charAt(0) || 'M'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">
                                                    {booking.guest?.full_name || 'Guest'}
                                                </span>
                                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {booking.guest?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </GuestReviewDialog>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium line-clamp-1 max-w-[200px]" title={booking.experience?.title}>
                                        {booking.experience?.title}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <BookingTimeInfo
                                        bookingDate={booking.booking_date}
                                        startTime={booking.start_time}
                                        endTime={booking.end_time}
                                        durationMinutes={booking.duration_minutes}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{booking.attendees_count}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-medium text-green-600">
                                        <DollarSign className="h-4 w-4" />
                                        ${booking.host_earnings}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <BookingStatusBadge status={booking.status || 'pending_payment'} />
                                </TableCell>
                                <TableCell>
                                    {(booking.status === 'pending_host_approval' || booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'paid_out') && (
                                        <BookingActions
                                            bookingId={booking.id}
                                            status={booking.status}
                                            hasReviewed={booking.reviews?.some((r) => r.reviewer_id === user?.id)}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
