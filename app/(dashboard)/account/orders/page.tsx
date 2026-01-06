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
import { MapPin, Ticket } from "lucide-react"
import Link from "next/link"
import { OrderActions } from "./order-actions"
import { BookingTimeInfo } from "@/modules/bookings/components/booking-time-info"
import { BookingStatusBadge } from "@/modules/bookings/components/booking-status-badge"
import { Database } from '@/types/supabase'

type BookingStatus = Database['public']['Enums']['booking_status']

export default async function OrdersPage() {
    const supabase = await createClient()
    const { user } = await requireAuth()

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            experience:experiences(title, location_city, images, duration_minutes, location_address),
            host:profiles!bookings_host_id_fkey(full_name, email, avatar_url),
            guest:profiles!bookings_user_id_fkey(full_name, email),
            reviews(reviewer_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (!bookings || bookings.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">My Bookings</h3>
                    <p className="text-sm text-muted-foreground">
                        Your past and upcoming travel plans.
                    </p>
                </div>
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="bg-background p-4 rounded-full shadow-sm">
                            <Ticket className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">You don't have any travel plans yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Start discovering unique experiences from the best hosts around the world.
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
            <div>
                <h3 className="text-lg font-medium">My Bookings</h3>
                <p className="text-sm text-muted-foreground">
                    Your past and upcoming travel plans.
                </p>
            </div>

            <div className="rounded-md border bg-card">
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
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{booking.experience?.title}</span>
                                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {booking.experience?.location_city}
                                        </div>
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
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
