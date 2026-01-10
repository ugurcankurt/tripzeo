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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownLeft, ArrowUpRight, DollarSign, Wallet } from "lucide-react"
import { ReceiptButton } from "@/components/shared/receipt-button"
import { requireHost } from "@/lib/auth/guards"
import { Tables } from "@/types/supabase"

export async function FinanceDashboard() {
    const { user } = await requireHost()
    const supabase = await createClient()

    // Fetch all confirmed/completed/paid_out bookings for this host
    const { data: transactions } = await supabase
        .from('bookings')
        .select(`
        id,
        created_at,
        booking_date,
        total_amount,
        host_earnings,
        commission_amount,
        service_fee,
        status,
        payment_id
    `)
        .eq('host_id', user.id)
        .in('status', ['confirmed', 'completed', 'paid_out'])
        .order('created_at', { ascending: false })
        .returns<Pick<Tables<'bookings'>, 'id' | 'created_at' | 'booking_date' | 'total_amount' | 'host_earnings' | 'commission_amount' | 'service_fee' | 'status' | 'payment_id'>[]>()

    // Calculate totals
    const totalEarnings = transactions?.reduce((acc, curr) => acc + (curr.host_earnings || 0), 0) || 0
    const pendingPayout = transactions
        ?.filter(t => t.status === 'confirmed' || t.status === 'completed')
        .reduce((acc, curr) => acc + (curr.host_earnings || 0), 0) || 0
    const completedPayout = transactions
        ?.filter(t => t.status === 'paid_out')
        .reduce((acc, curr) => acc + (curr.host_earnings || 0), 0) || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance & Earnings</h2>
                    <p className="text-muted-foreground">
                        Track your earnings and payment status here.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">All time total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${pendingPayout.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Balance in escrow</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${completedPayout.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Sent to your account</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                        Recent bookings and payout details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Transaction Type</TableHead>
                                <TableHead>Amount (Gross)</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead className="text-right">Net Earnings</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions?.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        {new Date(t.created_at).toLocaleDateString("en-US")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                            <span>Booking Revenue</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>${t.total_amount - t.service_fee}</TableCell>
                                    <TableCell className="text-red-500">-${t.commission_amount}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                        +${t.host_earnings}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-start gap-2">
                                            <Badge variant={t.status === 'paid_out' ? 'default' : 'secondary'}>
                                                {t.status === 'paid_out' ? 'Paid' : 'Escrow'}
                                            </Badge>
                                            {t.status === 'paid_out' && t.payment_id && (
                                                <ReceiptButton transferId={t.payment_id} />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!transactions || transactions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No transaction records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
