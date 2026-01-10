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
import { User, DollarSign, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookingActions } from "@/components/dashboard/booking-actions"
import { GuestReviewDialog } from "@/components/dashboard/guest-review-dialog"
import { BookingTimeInfo } from "@/modules/bookings/components/booking-time-info"
import { BookingStatusBadge } from "@/modules/bookings/components/booking-status-badge"
import { requireHost } from "@/lib/auth/guards"
import { EmptyState } from "@/components/shared/empty-state"
import { Tables } from "@/types/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type VendorBookingData = Tables<'bookings'> & {
    experience: Pick<Tables<'experiences'>, 'title' | 'images'> | null
    guest: Pick<Tables<'profiles'>, 'full_name' | 'email' | 'avatar_url' | 'phone'> | null
    reviews: Pick<Tables<'reviews'>, 'reviewer_id'>[]
}

export async function VendorBookingsList() {
    const { user } = await requireHost()
    const supabase = await createClient()

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
        *,
        experience:experiences(title, images),
        guest:profiles!user_id(full_name, email, avatar_url, phone),
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
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Incoming Orders</h2>
                    <p className="text-muted-foreground">
                        Manage your booking requests and view order details.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1">
                        Total: {bookings?.length || 0}
                    </Badge>
                </div>
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block rounded-md border bg-card">
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
                                    <div className="mt-2">
                                        <div className="mt-2">
                                            <div className="mt-2">
                                                <Link href={`?chat=${booking.id}`} scroll={false}>
                                                    <Button variant="outline" size="sm" className="gap-2 w-full">
                                                        <MessageSquare className="h-4 w-4" />
                                                        Chat
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {bookings?.map((booking) => (
                    <div key={booking.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-4 space-y-4">
                            {/* Header: Guest Info & Status */}
                            <div className="flex items-start justify-between">
                                <GuestReviewDialog guestId={booking.user_id} bookingId={booking.id} guestName={booking.guest?.full_name || undefined}>
                                    <div className="flex items-center gap-3 cursor-pointer">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={booking.guest?.avatar_url || ''} />
                                            <AvatarFallback>
                                                {booking.guest?.full_name?.charAt(0) || 'M'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm leading-none">
                                                {booking.guest?.full_name || 'Guest'}
                                            </p>
                                        </div>
                                    </div>
                                </GuestReviewDialog>
                                <BookingStatusBadge status={booking.status || 'pending_payment'} />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-dashed">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Experience</p>
                                    <p className="font-medium text-sm line-clamp-2 leading-snug">
                                        {booking.experience?.title}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-1">Earnings</p>
                                    <p className="font-bold text-green-600 flex items-center justify-end gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        {booking.host_earnings}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                                    <BookingTimeInfo
                                        bookingDate={booking.booking_date}
                                        startTime={booking.start_time}
                                        endTime={booking.end_time}
                                        durationMinutes={booking.duration_minutes}
                                    />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-1">Guests</p>
                                    <p className="font-medium text-sm flex items-center justify-end gap-1">
                                        <User className="h-3 w-3" />
                                        {booking.attendees_count} People
                                    </p>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            {(booking.status === 'pending_host_approval' || booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'paid_out') && (
                                <div className="flex justify-end pt-1">
                                    <BookingActions
                                        bookingId={booking.id}
                                        status={booking.status}
                                        hasReviewed={booking.reviews?.some((r) => r.reviewer_id === user?.id)}
                                    />
                                </div>
                            )}
                            <div className="flex justify-end pt-1">
                                <Link href={`?chat=${booking.id}`} scroll={false}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Chat
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
