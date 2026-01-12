import { getPartnerData } from "@/modules/partner/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, CreditCard, DollarSign, TrendingUp, Users, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Simple Copy Component (Server Component wrapper limitation, so using client inline logic or separate component)
// For simplicity, I'll make a small client component for the copy button logic if needed, 
// or just a simple form. Actually, let's make the whole page client or split it.
// To keep it simple, I'll use a Client Component for the "Copy Link" section.

import { PartnerRefCard } from "@/modules/partner/components/partner-ref-card"

export default async function PartnerDashboardPage() {
    const data = await getPartnerData()

    if (data.error) {
        return <div className="p-8 text-center text-red-500">Access Denied: {data.error}</div>
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Partner Dashboard</h2>
                <p className="text-muted-foreground">Track your referrals and earnings.</p>
            </div>

            {!data.isBankInfoComplete && (
                <Alert variant="destructive" className="border-orange-200 bg-orange-50 text-orange-900 [&>svg]:text-orange-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Bank Details</AlertTitle>
                    <AlertDescription>
                        You have not set up your payout information yet. You will not be able to receive payments until you add your bank details.
                        <Link href="/account" className="font-semibold underline ml-2">
                            Go to Profile Settings
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalEarnings || 0)}</div>
                        <p className="text-xs text-muted-foreground">+0% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.pendingEarnings || 0)}</div>
                        <p className="text-xs text-muted-foreground">Processing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals (Bookings)</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.conversionCount}</div>
                        <p className="text-xs text-muted-foreground">Successful bookings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#FF4F30]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">10%</div>
                        <p className="text-xs text-muted-foreground">Per booking</p>
                    </CardContent>
                </Card>
            </div>

            {/* Referral Link Section */}
            <PartnerRefCard referralCode={data.referralCode} />

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Earning Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.transactions && data.transactions.length > 0 ? (
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium">Booking ID</th>
                                            <th className="p-4 font-medium">Description</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {data.transactions.map((t: any) => (
                                            <tr key={t.id} className="border-t hover:bg-muted/50 transition-colors">
                                                <td className="p-4">{new Date(t.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 font-mono text-xs">{t.booking_id?.slice(0, 8).toUpperCase() || '-'}</td>
                                                <td className="p-4">{t.description}</td>
                                                <td className="p-4">
                                                    <Badge variant={t.status === 'completed' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'} className={t.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                        {t.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right font-medium">
                                                    {formatCurrency(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No transactions yet. Start referring!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
