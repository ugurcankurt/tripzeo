
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
import { PayoutActions } from "@/modules/finance/components/payout-actions"
import { ReceiptButton } from "@/components/shared/receipt-button"
import { AdminPageHeader } from "@/components/admin/page-header"

// Simple CSV export function (client-side capable via data URI or server action)
// Since this is a server component, we'll embed the data or use a simple form action.
// For simplicity/speed in this context, we'll just prep the data and make a client component wrapper or
// Since we have the data here, let's just make a simple client component for the button that takes the data prop.
import { ExportPayoutsButton } from "../../../modules/finance/components/export-payouts-button"

import { getPlatformSettings } from '@/modules/platform/actions'

export default async function AdminPayoutsPage() {
    const supabase = await createClient()

    // Fetch dynamic settings
    const settings = await getPlatformSettings()
    // Database returns rate as decimal (e.g. 0.15), we need percentage (15)
    // Also key is uppercase COMMISSION_RATE
    const rawRate = settings.find(s => s.key === 'COMMISSION_RATE' || s.key === 'commission_rate')?.value ?? 0
    const commissionRate = rawRate * 100
    const hostShare = 100 - commissionRate

    type PayoutBooking = Tables<'bookings'> & {
        host: Pick<Tables<'profiles'>, 'full_name' | 'email' | 'iban' | 'bank_name' | 'account_holder' | 'routing_number' | 'account_number' | 'bank_code' | 'bank_country'> | null
    }

    // Status: confirmed (passed date), completed. Paid_out excluded from 'Pending' view usually?
    // User wants to see payouts to process. 'paid_out' are history.
    // Let's keep logic similar but maybe separate or filter.
    // The current query pulls everything.
    const { data: payouts } = await supabase
        .from('bookings')
        .select('*, host:profiles!bookings_host_id_fkey(full_name, email, iban, bank_name, account_holder, routing_number, account_number, bank_code, bank_country)')
        .in('status', ['confirmed', 'completed', 'paid_out'])
        .order('booking_date', { ascending: true })
        .returns<PayoutBooking[]>()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <AdminPageHeader heading="Payouts & Earnings" text="Manage pending payouts and view payment history." />
                {/* Pass only PENDING payouts to export usually, or all displayed? Let's pass all displayed for now. */}
                {payouts && payouts.length > 0 && (
                    <ExportPayoutsButton payouts={payouts} />
                )}
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Host Info</TableHead>
                            <TableHead>Bank Details</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Commission (%{commissionRate})</TableHead>
                            <TableHead>Host Payout (%{hostShare})</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts?.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}...</TableCell>
                                <TableCell className="font-mono text-xs">
                                    {booking.host_id.slice(0, 8)}...<br />
                                    <span className="text-muted-foreground">{booking.host?.full_name}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold">{booking.host?.bank_name}</span>
                                            {booking.host?.bank_country === 'US' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-medium">USD</span>}
                                            {booking.host?.bank_country === 'TR' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-medium">TL</span>}
                                            {(booking.host?.bank_country === 'EU' || booking.host?.bank_country === 'OTHER') && <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700 font-medium">EUR</span>}
                                        </div>
                                        <div className="mb-1">{booking.host?.account_holder}</div>
                                        {/* Dynamic Display based on country */}
                                        {booking.host?.bank_country === 'US' ? (
                                            <>
                                                <div className="font-mono text-[10px] text-muted-foreground">ACH: {booking.host?.routing_number}</div>
                                                <div className="font-mono text-[10px]">ACC: {booking.host?.account_number}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="font-mono text-[10px]">{booking.host?.iban}</div>
                                                {booking.host?.bank_code && <div className="font-mono text-[10px] text-muted-foreground">BIC: {booking.host?.bank_code}</div>}
                                            </>
                                        )}

                                    </div>
                                </TableCell>
                                <TableCell>${booking.total_amount}</TableCell>
                                <TableCell className="text-red-600">${booking.commission_amount.toFixed(2)}</TableCell>
                                <TableCell className="font-bold text-green-600">${booking.host_earnings.toFixed(2)}</TableCell>
                                <TableCell>{new Date(booking.booking_date).toLocaleDateString("en-US")}</TableCell>
                                <TableCell className="text-right">
                                    {booking.status === 'paid_out' ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-green-600 font-medium text-sm">Paid</div>
                                            {booking.payment_id && <ReceiptButton transferId={booking.payment_id} />}
                                        </div>
                                    ) : (
                                        <PayoutActions bookingId={booking.id} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!payouts || payouts.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No payouts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
