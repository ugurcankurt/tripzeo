import { createClient } from "@/lib/supabase/server"
import { DashboardBooking, DashboardBookingSummary, DashboardUser } from "@/modules/admin/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Users, CreditCard, CalendarCheck, TrendingUp } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // 1. İstatistikleri Çek
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    const { data: bookings } = await supabase
        .from('bookings')
        .select('total_amount, status, commission_amount')
        .returns<DashboardBookingSummary[]>()

    // 2. Son 5 Kullanıcıyı Çek
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
        .returns<DashboardUser[]>()

    // 3. Son 5 Rezervasyonu Çek
    const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
            id,
            total_amount,
            status,
            created_at,
            user:profiles!bookings_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
        .returns<DashboardBooking[]>()

    const totalBookings = bookings?.length || 0
    const activeBookings = bookings?.filter(b => b.status === 'confirmed').length || 0

    // Gelir Hesaplama
    let totalRevenue = 0
    let totalCommission = 0

    bookings?.forEach(b => {
        if (b.status === 'confirmed' || b.status === 'completed' || b.status === 'paid_out') {
            totalRevenue += b.total_amount
            totalCommission += b.commission_amount
        }
    })

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Tripzeo Admin Center</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue (Volume)"
                    value={`$${totalRevenue.toLocaleString('en-US')}`}
                    description="Total money flow through platform"
                    icon={CreditCard}
                />

                <StatsCard
                    title="Tripzeo Revenue"
                    value={`$${totalCommission.toLocaleString('en-US')}`}
                    description="Commission earnings"
                    icon={TrendingUp}
                    iconClassName="text-green-600"
                    valueClassName="text-green-600"
                />

                <StatsCard
                    title="Active Bookings"
                    value={activeBookings}
                    description="Pending realization"
                    icon={CalendarCheck}
                />

                <StatsCard
                    title="Total Users"
                    value={usersCount || 0}
                    description="Registered travelers and hosts"
                    icon={Users}
                />
            </div>

            {/* Hızlı Erişim Menüsü */}
            {/* Hızlı Erişim Menüsü / Özet Tablolar */}
            <div className="grid gap-4 md:grid-cols-2">

                {/* Son Kullanıcılar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>Latest registered users to the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers?.map((user) => (
                                    <TableRow key={user.email}>
                                        <TableCell>
                                            <div className="font-medium">{user.full_name || 'Anonymous'}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs">
                                            {new Date(user.created_at).toLocaleDateString("en-US")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Son Rezervasyonlar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>Latest booking activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Guest</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings?.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell>
                                            <div className="font-medium">{booking.user?.full_name || 'Guest'}</div>
                                            <div className="text-xs text-muted-foreground text-ellipsis overflow-hidden w-[100px]">
                                                {booking.id}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                booking.status === 'confirmed' ? 'default' :
                                                    booking.status === 'completed' ? 'secondary' :
                                                        booking.status === 'paid_out' ? 'outline' : 'destructive'
                                            }>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${booking.total_amount}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
