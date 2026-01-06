
import { createClient } from "@/lib/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AdminBookingActions } from "@/modules/bookings/components/admin-booking-actions"
import { Database } from "@/types/supabase"
import { BookingTimeInfo } from "@/modules/bookings/components/booking-time-info"
import { BookingStatusBadge } from "@/modules/bookings/components/booking-status-badge"
import { AdminPageHeader } from "@/components/admin/page-header"

type BookingWithRelations = Database['public']['Tables']['bookings']['Row'] & {
    experience: { title: string } | null
    user: { full_name: string | null } | null
    host: { full_name: string | null } | null
}

export default async function AdminBookingsPage() {
    const supabase = await createClient()

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
        *,
        experience:experiences(title),
        user:profiles!bookings_user_id_fkey(full_name),
        host:profiles!bookings_host_id_fkey(full_name)
    `)
        .order('created_at', { ascending: false })
        .returns<BookingWithRelations[]>()

    return (
        <div className="space-y-6">
            <AdminPageHeader heading="Booking Management" />

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Traveler</TableHead>
                            <TableHead>Host</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings?.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}...</TableCell>
                                <TableCell className="max-w-[200px] truncate">{booking.experience?.title}</TableCell>
                                <TableCell>{booking.user?.full_name || 'Unknown'}</TableCell>
                                <TableCell>{booking.host?.full_name || booking.host_id.slice(0, 8) + '...'}</TableCell>
                                <TableCell>
                                    <BookingTimeInfo
                                        bookingDate={booking.booking_date}
                                        startTime={booking.start_time}
                                        endTime={booking.end_time}
                                        durationMinutes={booking.duration_minutes}
                                    />
                                </TableCell>
                                <TableCell>
                                    <BookingStatusBadge status={booking.status} />
                                </TableCell>
                                <TableCell>${booking.total_amount}</TableCell>
                                <TableCell className="text-right">
                                    <AdminBookingActions booking={booking} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
