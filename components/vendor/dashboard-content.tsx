import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/types/supabase"
import { requireAuth } from "@/lib/auth/guards"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Store, CreditCard } from "lucide-react"
import Link from "next/link"
import { VendorExperienceCard } from "@/modules/experiences/components/vendor-experience-card"
import { EmptyState } from "@/components/shared/empty-state"

export async function VendorDashboardContent() {
    const supabase = await createClient()
    const { user } = await requireAuth()

    // Fetch experiences
    const { data: experiences } = await supabase
        .from('experiences')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .returns<Tables<'experiences'>[]>()

    // Fetch bookings for stats
    const { data: bookings } = await supabase
        .from('bookings')
        .select('host_earnings, status')
        .eq('host_id', user.id)
        .returns<Pick<Tables<'bookings'>, 'host_earnings' | 'status'>[]>()

    // Calculate stats
    const activeListings = experiences?.length || 0
    const totalRevenue = bookings?.reduce((acc, booking) => {
        if (['confirmed', 'completed', 'paid_out'].includes(booking.status || '')) {
            return acc + Number(booking.host_earnings)
        }
        return acc
    }, 0) || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Host Dashboard</h2>
                    <p className="text-muted-foreground">
                        Overview of your listings, performance, and revenue.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/vendor/products/new">Add New Experience</Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}
                    description="Lifetime earnings"
                    icon={CreditCard}
                />
                <StatsCard
                    title="Active Listings"
                    value={activeListings}
                    icon={Store}
                />
            </div>

            {experiences && experiences.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {experiences?.map((experience) => (
                        <VendorExperienceCard key={experience.id} experience={experience} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="You haven't added any experiences yet."
                    description="Start teaching your skills or showing people around the city."
                    action={{
                        label: "Create Your First Listing",
                        href: "/vendor/products/new"
                    }}
                />
            )}
        </div>
    )
}
