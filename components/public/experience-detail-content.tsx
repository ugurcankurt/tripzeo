import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BookingForm } from "@/modules/bookings/components/booking-form"
import { ReviewList } from "@/modules/reviews/components/review-list"
import { ExperienceGallery } from "@/modules/experiences/components/experience-gallery"
import { MobileBookingBar } from "@/modules/bookings/components/mobile-booking-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Users, Clock, Timer } from "lucide-react"
import Link from "next/link"
import { slugify } from "@/lib/utils"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ExperienceDetailData, ReviewData } from "@/types/experiences"

// Define props for the content wrapper
interface ExperienceDetailContentProps {
    country: string
    city: string
    slug: string
}

export async function ExperienceDetailContent({ country, city, slug }: ExperienceDetailContentProps) {
    const supabase = await createClient()

    // Extract ID using standard logic (last 36 characters for UUID)
    const experienceId = slug.slice(-36)

    const { data: { user } } = await supabase.auth.getUser()

    // Query 1: Fetch Experience Detail
    const { data: experienceData } = await supabase
        .from('experiences')
        .select(`
        *,
        host:profiles(
            full_name, 
            avatar_url, 
            bio,
            category:categories(icon)
        )
    `)
        .eq('id', experienceId)
        .single()

    const experience = experienceData as unknown as ExperienceDetailData | null

    // Query 2: Fetch Service Fee
    const { data: serviceFeeSetting } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'SERVICE_FEE_RATE')
        .single()

    // Default to 0 if not set
    const serviceFeeRate = serviceFeeSetting?.value ? Number(serviceFeeSetting.value) : 0

    if (!experience || !experience.is_active) {
        notFound()
    }

    // Query 3: Fetch availability (blocked dates)
    const { data: availabilityData } = await supabase
        .from('experience_availability')
        .select('date')
        .eq('experience_id', experienceId)
        .eq('is_blocked', true)
        .gte('date', new Date().toISOString().split('T')[0]) // Only future blocked dates

    const blockedDates = availabilityData?.map(a => a.date) || []

    // Query 4: Fetch Reviews
    const supabaseAdmin = createAdminClient()
    const { data: reviewsData } = await supabaseAdmin
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer:reviewer_id(full_name, avatar_url),
            booking:bookings!inner(experience_id)
        `)
        .eq('booking.experience_id', experienceId)
        .eq('type', 'host_review')
        .order('created_at', { ascending: false })

    const reviews = (reviewsData || []) as unknown as ReviewData[]

    // Construct JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": experience.title,
        "description": experience.description,
        "image": experience.images,
        "offers": {
            "@type": "Offer",
            "price": experience.price,
            "priceCurrency": "USD", // Assuming USD as standard
            "availability": "https://schema.org/InStock",
            "url": `https://tripzeo.com/${country}/${city}/${slug}`
        },
        "aggregateRating": experience.rating ? {
            "@type": "AggregateRating",
            "ratingValue": experience.rating,
            "reviewCount": experience.review_count
        } : undefined,
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://tripzeo.com"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": experience.location_city,
                    "item": `https://tripzeo.com/${slugify(experience.location_country)}/${slugify(experience.location_city)}`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": experience.title,
                    "item": `https://tripzeo.com/${slugify(experience.location_country)}/${slugify(experience.location_city)}/${slug}`
                }
            ]
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl pb-24 lg:pb-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Visual Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/${slugify(experience.location_country)}/${slugify(experience.location_city)}`}>
                                {experience.location_city}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{experience.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Gallery */}
            <div className="mb-10">
                <ExperienceGallery images={experience.images} title={experience.title} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <h1 className="text-4xl font-bold mb-4 tracking-tight">{experience.title}</h1>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-2">
                            {/* Location */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                                <div className="p-2.5 bg-background rounded-full shadow-sm shrink-0 text-primary">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</span>
                                    <span className="text-sm font-medium truncate">{experience.location_city}</span>
                                </div>
                            </div>

                            {/* Duration */}
                            {experience.duration_minutes && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                                    <div className="p-2.5 bg-background rounded-full shadow-sm shrink-0 text-primary">
                                        <Timer className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Duration</span>
                                        <span className="text-sm font-medium truncate">{experience.duration_minutes} Mins</span>
                                    </div>
                                </div>
                            )}

                            {/* Time */}
                            {(experience.start_time && experience.end_time) && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                                    <div className="p-2.5 bg-background rounded-full shadow-sm shrink-0 text-primary">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Time</span>
                                        <span className="text-sm font-medium truncate">{experience.start_time.slice(0, 5)} - {experience.end_time.slice(0, 5)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Capacity */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                                <div className="p-2.5 bg-background rounded-full shadow-sm shrink-0 text-primary">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Group Size</span>
                                    <span className="text-sm font-medium truncate">Max {experience.capacity}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Host Info */}
                    <div className="flex items-start gap-4">
                        <Link href={`/host/${slugify(experience.host?.full_name || 'host')}-${experience.host_id}`}>
                            <Avatar className="h-16 w-16 border hover:opacity-80 transition-opacity">
                                {/* @ts-ignore - nested join type inference */}
                                <AvatarImage src={experience.host?.avatar_url || experience.host?.category?.icon || ''} className="object-contain" />
                                <AvatarFallback>{experience.host?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <Link href={`/host/${slugify(experience.host?.full_name || 'host')}-${experience.host_id}`} className="hover:underline">
                                <h3 className="font-semibold text-lg">{experience.host?.full_name}</h3>
                            </Link>
                            <p className="text-muted-foreground text-sm line-clamp-3">
                                {experience.host?.bio || "This host hasn't written a bio yet, but they're great at what they do!"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="prose max-w-none">
                        <h3 className="text-xl font-semibold mb-3">About the Experience</h3>
                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                            {experience.description}
                        </p>
                    </div>

                    {/* Reviews */}
                    <div>
                        <h3 className="text-xl font-semibold mb-6">Guest Reviews</h3>
                        <ReviewList experienceId={experience.id} initialReviews={reviews} />
                    </div>
                </div>

                {/* Right Column: Booking Card */}
                <div id="booking-card-section" className="space-y-6 hidden lg:block">
                    <BookingForm
                        experienceId={experience.id}
                        price={experience.price}
                        capacity={experience.capacity}
                        currentUserId={user?.id}
                        hostId={experience.host_id}
                        serviceFeeRate={serviceFeeRate}
                        blockedDates={blockedDates}
                    />
                </div>
            </div>

            {/* Mobile Booking Bar */}
            <MobileBookingBar
                experienceId={experience.id}
                price={experience.price}
                capacity={experience.capacity}
                currentUserId={user?.id}
                hostId={experience.host_id}
                serviceFeeRate={serviceFeeRate}
                blockedDates={blockedDates}
            />
        </div>
    )
}
