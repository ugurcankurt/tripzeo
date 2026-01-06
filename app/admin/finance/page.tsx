
import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/types/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Wallet, TrendingUp, ArrowUpRight } from "lucide-react"
import { FinanceCharts, MonthlyData } from "@/modules/finance/components/finance-charts"
import { AdminPageHeader } from "@/components/admin/page-header"

export default async function AdminFinancePage() {
    const supabase = await createClient()

    // Fetch all relevant bookings (confirmed, completed, paid_out)
    const { data: bookings } = await supabase
        .from('bookings')
        .select('booking_date, total_amount, commission_amount, service_fee, host_earnings, status')
        .in('status', ['confirmed', 'completed', 'paid_out'])
        .order('booking_date', { ascending: true })
        .returns<Pick<Tables<'bookings'>, 'booking_date' | 'total_amount' | 'commission_amount' | 'service_fee' | 'host_earnings' | 'status'>[]>()

    // Process data for charts
    // Group by month
    const monthlyStats: Record<string, MonthlyData> = {}

    // Init last 6 months
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthKey = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
        monthlyStats[monthKey] = {
            name: monthKey,
            revenue: 0,
            commission: 0,
            payout: 0,
        }
    }

    // Aggregate data
    bookings?.forEach(booking => {
        const date = new Date(booking.booking_date)
        const monthKey = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })

        // Only count if it falls within our tracked months
        if (monthlyStats[monthKey]) {
            monthlyStats[monthKey].revenue += booking.total_amount
            monthlyStats[monthKey].commission += (booking.commission_amount + (booking.service_fee || 0))
            monthlyStats[monthKey].payout += booking.host_earnings
        }
    })

    const chartData = Object.values(monthlyStats)

    // Calculate Summary Stats
    const totalVolume = bookings?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0
    const totalCommission = bookings?.reduce((acc, curr) => acc + (curr.commission_amount + (curr.service_fee || 0)), 0) || 0
    const totalPayouts = bookings?.reduce((acc, curr) => acc + curr.host_earnings, 0) || 0
    // Pending payouts -> Confirmed/Completed but NOT paid_out
    const pendingPayouts = bookings
        ?.filter(b => b.status !== 'paid_out')
        .reduce((acc, curr) => acc + curr.host_earnings, 0) || 0


    return (
        <div className="space-y-6">
            <AdminPageHeader heading="Financial Overview" text="Detailed breakdown of earnings, expenses, and platform health." />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalVolume.toLocaleString('en-US')}</div>
                        <p className="text-xs text-muted-foreground">Gross Merchandise Value</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalCommission.toLocaleString('en-US')}</div>
                        <p className="text-xs text-muted-foreground">Commission + Service Fees</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid to Hosts</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">${(totalPayouts - pendingPayouts).toLocaleString('en-US')}</div>
                        <p className="text-xs text-muted-foreground">Completed transfers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                        <Wallet className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">${pendingPayouts.toLocaleString('en-US')}</div>
                        <p className="text-xs text-muted-foreground">Waiting for disbursement</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <FinanceCharts data={chartData} />
        </div>
    )
}
