import { Suspense } from "react"
import { VendorDashboardContent } from "@/components/vendor/dashboard-content"
import { VendorDashboardSkeleton } from "@/components/skeletons/vendor-dashboard-skeleton"
import { requireAuth } from "@/lib/auth/guards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle2, Store, CreditCard } from "lucide-react"
import Link from "next/link"
import { BecomeHostButton } from "@/components/dashboard/become-host-button"

export default async function VendorPage() {
    const { profile } = await requireAuth()

    const isHost = profile?.role === 'host'
    const isPending = profile?.verification_status === 'pending'

    if (isHost) {
        return (
            <Suspense fallback={<VendorDashboardSkeleton />}>
                <VendorDashboardContent />
            </Suspense>
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
                            This process usually takes 24-48 hours. Don&apos;t forget to complete your profile in the meantime.
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
