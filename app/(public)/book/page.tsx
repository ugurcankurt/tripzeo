import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { BookingConfirmationForm } from "@/modules/bookings/components/booking-confirmation-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { format } from "date-fns"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function BookPage({ searchParams }: { searchParams: Promise<{ experienceId: string; date: string; people: string }> }) {
    const supabase = await createClient()
    const { experienceId, date, people } = await searchParams

    if (!experienceId || !date || !people) {
        redirect('/')
    }

    const { data: { user } } = await supabase.auth.getUser()

    let userProfile = null
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        userProfile = data
    }

    // Fetch Experience
    const { data: experience } = await supabase
        .from('experiences')
        .select(`
            id,
            title,
            price,
            images,
            location_city,
            duration_minutes,
            start_time,
            end_time,
            host:profiles(full_name)
        `)
        .eq('id', experienceId)
        .single()

    if (!experience) notFound()


    // Fetch Service Fee Rate
    const { data: serviceFeeSetting } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'SERVICE_FEE_RATE')
        .single()

    // Default to 0.05 (5%) if not set
    const serviceFeeRate = serviceFeeSetting?.value ? Number(serviceFeeSetting.value) : 0.05

    // Calculations
    const numPeople = parseInt(people)
    const subtotal = experience.price * numPeople
    const serviceFee = subtotal * serviceFeeRate
    const total = subtotal + serviceFee

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Visual Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/experience/${experienceId}`}>Experience</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Confirm Booking</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <h1 className="text-3xl font-bold mb-8">Confirm and Pay</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* LEFT: Guest Details & Payment Info */}
                <div>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Your Details</h2>
                        {user ? (
                            <div className="p-4 bg-muted/50 rounded-lg border mb-6 space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Logged in as</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <Separator />
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-muted-foreground">Billing Address</p>
                                        <a href="/account" className="text-xs text-primary hover:underline">Edit</a>
                                    </div>
                                    {userProfile?.address ? (
                                        <div className="text-sm">
                                            <p>{userProfile.address}</p>
                                            <p>{userProfile.city}, {userProfile.country}</p>
                                            <p>{userProfile.zip_code}</p>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-amber-600 flex items-center gap-2">
                                            <span>Missing address info.</span>
                                            <a href="/account" className="underline font-medium">Add Address</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground mb-4">
                                Enter your details to create an account and complete your booking.
                            </p>
                        )}

                        <BookingConfirmationForm
                            experienceId={experienceId}
                            date={date}
                            people={numPeople}
                            totalAmount={total}
                            currentUser={user}
                            userProfile={userProfile}
                            duration={experience.duration_minutes || undefined}
                            startTime={experience.start_time || undefined}
                            endTime={experience.end_time || undefined}
                        />
                    </div>
                </div>

                {/* RIGHT: Order Summary */}
                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <div className="flex gap-4">


                                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                                    <Image
                                        src={experience.images?.[0] || '/images/placeholders/experience-placeholder.jpg'} // Assuming we have a placeholder or use a safe default
                                        alt={experience.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">{experience.location_city}</p>
                                    <h3 className="font-medium line-clamp-2">{experience.title}</h3>
                                    <p className="text-sm mt-1">Hosted by {experience.host?.full_name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-lg">Price Details</h3>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">${experience.price} x {numPeople} people</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Service Fee</span>
                                <span>${serviceFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span>{format(new Date(date), 'PPP')}</span>
                            </div>

                            {experience.start_time && experience.end_time && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span>{experience.start_time.slice(0, 5)} - {experience.end_time.slice(0, 5)}</span>
                                </div>
                            )}

                            {experience.duration_minutes && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span>{experience.duration_minutes} Mins</span>
                                </div>
                            )}

                            <Separator />

                            <div className="flex justify-between font-bold text-xl">
                                <span>Total (USD)</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
