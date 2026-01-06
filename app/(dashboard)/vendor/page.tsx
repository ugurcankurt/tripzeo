import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/types/supabase"
import { requireAuth } from "@/lib/auth/guards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CheckCircle2, Store, CreditCard } from "lucide-react"
import { requestHostAccess } from "@/modules/auth/actions"
import Link from "next/link"
import { VendorExperienceCard } from "@/modules/experiences/components/vendor-experience-card"
import { redirect } from "next/navigation"
import { EmptyState } from "@/components/shared/empty-state"
import { BecomeHostButton } from "@/components/dashboard/become-host-button"

export default async function VendorPage() {
    const supabase = await createClient()
    const { user, profile } = await requireAuth()

    const isHost = profile?.role === 'host'
    const isPending = profile?.verification_status === 'pending'

    if (isHost) {
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

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center space-y-8">
                <Card className="w-full">
                    <CardHeader>
                        <div className="mx-auto bg-yellow-100 p-3 rounded-full mb-4">
                            <CheckCircle2 className="h-8 w-8 text-yellow-600" />
                        </div>
                        <CardTitle className="text-2xl">Application Under Review</CardTitle>
                        <CardDescription className="text-lg">
                            Your request to become a host has been received. Our team will review your application and get back to you via email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            This process usually takes 24-48 hours. Don't forget to complete your profile in the meantime.
                        </p>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/account">Edit Profile</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Not a host yet - Show Onboarding CTA
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Ready to Become a Host?</h1>
                <p className="text-xl text-muted-foreground">
                    Turn your passions into income. Create experiences on Tripzeo and reach thousands of travelers.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 w-full text-left">
                <Card>
                    <CardHeader>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <CardTitle className="text-base">Secure Payment</CardTitle>
                        <CardDescription>Your money is safe in Tripzeo escrow.</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <CardTitle className="text-base">Fair Commission</CardTitle>
                        <CardDescription>You only pay when you earn.</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <CardTitle className="text-base">Global Showcase</CardTitle>
                        <CardDescription>Be seen by guests from all over the world.</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <BecomeHostButton />
        </div>
    )
}
