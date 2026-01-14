import { getExperienceUrl } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { BookingConfirmationForm } from "@/modules/bookings/components/booking-confirmation-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tables } from "@/types/supabase"

type BookingExperience = Pick<Tables<'experiences'>,
    'id' | 'title' | 'price' | 'images' | 'location_city' | 'location_country' | 'duration_minutes' | 'start_time' | 'end_time'
> & {
    host: Pick<Tables<'profiles'>, 'full_name'> | null
}

export default async function BookPage({ searchParams }: { searchParams: Promise<{ experienceId: string; date: string; people: string }> }) {
    const supabase = await createClient()
    const { experienceId, date, people } = await searchParams

    if (!experienceId || !date || !people) {
        redirect('/')
    }

    const { data: { user } } = await supabase.auth.getUser()

    let userProfile: Tables<'profiles'> | null = null
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        userProfile = data
    }

    // Fetch Experience
    const { data } = await supabase
        .from('experiences')
        .select(`
            id,
            title,
            price,
            images,
            location_city,
            location_country,
            duration_minutes,
            start_time,
            end_time,
            host:profiles(full_name)
        `)
        .eq('id', experienceId)
        .single()

    if (!data) notFound()

    const experience = data as unknown as BookingExperience


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
        <div className="container mx-auto px-4 py-12">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-12">
                {/* LEFT: Guest Details & Payment Info */}
                <div className="order-last lg:order-none">
                    <div className="lg:mb-8">
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
                                        <Link href="/account" className="text-xs text-primary hover:underline">Edit</Link>
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
                                            <Link href="/account" className="underline font-medium">Add Address</Link>
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
                <div className="order-first lg:order-none">
                    <Card className="lg:sticky lg:top-24">
                        <CardHeader className="p-4">
                            <Link href={getExperienceUrl(experience)} target="_blank" className="flex gap-4 group hover:opacity-90 transition-opacity">
                                <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-muted border">
                                    <Image
                                        src={experience.images?.[0] || '/images/placeholders/experience-placeholder.jpg'}
                                        alt={experience.title}
                                        fill
                                        sizes="112px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex flex-col justify-center space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        {experience.location_city}, {experience.location_country || 'Turkey'}
                                    </p>
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:underline decoration-primary underline-offset-4">
                                        {experience.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Hosted by <span className="text-foreground font-medium">{experience.host?.full_name}</span>
                                    </p>
                                </div>
                            </Link>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-lg">Price Details</h3>

                            <div className="flex justify-between">
                                <span className="text-muted-foreground">${experience.price} x {numPeople} people</span>
                                <span className="">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Service Fee</span>
                                <span className="">${serviceFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span className="">{format(new Date(date), 'PPP')}</span>
                            </div>

                            {experience.start_time && experience.end_time && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span className="">{experience.start_time.slice(0, 5)} - {experience.end_time.slice(0, 5)}</span>
                                </div>
                            )}

                            {experience.duration_minutes && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="">{experience.duration_minutes} Mins</span>
                                </div>
                            )}

                            <Separator />

                            <div className="flex justify-between font-bold text-xl">
                                <span>Total (USD)</span>
                                <span className="">${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
