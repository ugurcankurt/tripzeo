import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/guards"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Ticket, MessageSquare } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { OrderActions } from "./order-actions"
import { BookingTimeInfo } from "@/modules/bookings/components/booking-time-info"
import { BookingStatusBadge } from "@/modules/bookings/components/booking-status-badge"
// import { ChatSheet } from "@/components/messaging/chat-sheet"
import { Database } from '@/types/supabase'

type BookingStatus = Database['public']['Enums']['booking_status']

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const chatBookingId = typeof params.chat === 'string' ? params.chat : null

    // GlobalChatWidget handles the '?chat=' param automatically.

    const supabase = await createClient()
    const { user } = await requireAuth()

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            experience:experiences(title, location_city, images, duration_minutes, location_address),
            host:profiles!bookings_host_id_fkey(full_name, email, avatar_url, phone),
            guest:profiles!bookings_user_id_fkey(full_name, email),
            reviews(reviewer_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (!bookings || bookings.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
                        <p className="text-muted-foreground">
                            Track your upcoming experiences and past adventures.
                        </p>
                    </div>
                </div>
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="bg-background p-4 rounded-full shadow-sm">
                            <Ticket className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">No experiences booked yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Explore unique activities and book your next adventure.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/">Start Exploring</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
                    <p className="text-muted-foreground">
                        Track your upcoming experiences and past adventures.
                    </p>
                </div>
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Experience</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>People</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{booking.experience?.title}</span>
                                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {booking.experience?.location_city}
                                            </div>
                                        </div>

                                        {/* Host Info Removed as per request */}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <BookingTimeInfo
                                        bookingDate={booking.booking_date}
                                        startTime={booking.start_time}
                                        endTime={booking.end_time}
                                        durationMinutes={booking.duration_minutes}
                                    />
                                </TableCell>
                                <TableCell>{booking.attendees_count} People</TableCell>
                                <TableCell className="font-medium text-right">${booking.total_amount}</TableCell>
                                <TableCell>
                                    <BookingStatusBadge status={booking.status || 'pending_payment'} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {(booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'paid_out') && (
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/tickets/${booking.id}`}>View Ticket</Link>
                                            </Button>
                                        )}
                                        {booking.status === 'pending_payment' && (
                                            <Button asChild size="sm">
                                                <Link href={`/payment/${booking.id}`}>Complete Payment</Link>
                                            </Button>
                                        )}
                                        <OrderActions
                                            bookingId={booking.id}
                                            status={booking.status || 'pending_payment'}
                                            hasReviewed={Array.isArray(booking.reviews) && booking.reviews.some((r: { reviewer_id: string }) => r.reviewer_id === user.id)}
                                            bookingDate={booking.booking_date}
                                            startTime={booking.start_time}
                                        />
                                        <Link href={`?chat=${booking.id}`} scroll={false}>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                Chat
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                        <CardContent className="p-4 space-y-4">
                            {/* Header: Status and Price */}
                            <div className="flex items-center justify-between">
                                <BookingStatusBadge status={booking.status || 'pending_payment'} />
                                <span className="font-bold text-lg">${booking.total_amount}</span>
                            </div>

                            {/* Title and Location */}
                            <div className="space-y-1">
                                <h3 className="font-semibold line-clamp-2 leading-tight">
                                    {booking.experience?.title}
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {booking.experience?.location_city}
                                </div>
                            </div>

                            {/* Host Info Removed as per request */}

                            {/* Details: Date and People */}
                            <div className="grid grid-cols-2 gap-4 text-sm border-t border-b py-3 my-3 border-dashed">
                                <div>
                                    <span className="block text-muted-foreground text-xs mb-1">Date & Time</span>
                                    <BookingTimeInfo
                                        bookingDate={booking.booking_date}
                                        startTime={booking.start_time}
                                        endTime={booking.end_time}
                                        durationMinutes={booking.duration_minutes}
                                    />
                                </div>
                                <div>
                                    <span className="block text-muted-foreground text-xs mb-1">Guests</span>
                                    <span className="font-medium">{booking.attendees_count} People</span>
                                </div>
                            </div>

                            {/* Footer: Actions */}
                            <div className="flex items-center gap-2 pt-1">
                                {(booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'paid_out') && (
                                    <Button asChild className="flex-1" variant="outline">
                                        <Link href={`/tickets/${booking.id}`}>View Ticket</Link>
                                    </Button>
                                )}
                                {booking.status === 'pending_payment' && (
                                    <Button asChild className="flex-1">
                                        <Link href={`/payment/${booking.id}`}>Complete Payment</Link>
                                    </Button>
                                )}
                                <div className="flex-none">
                                    <OrderActions
                                        bookingId={booking.id}
                                        status={booking.status || 'pending_payment'}
                                        hasReviewed={Array.isArray(booking.reviews) && booking.reviews.some((r: { reviewer_id: string }) => r.reviewer_id === user.id)}
                                        bookingDate={booking.booking_date}
                                        startTime={booking.start_time}
                                    />
                                    <Link href={`?chat=${booking.id}`} scroll={false}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Chat
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
