import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, ShieldCheck, Star } from "lucide-react"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { ReviewList } from "@/modules/reviews/components/review-list"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export async function HostProfileContent({ hostId }: { hostId: string }) {
    const supabase = await createClient()

    // 1. Fetch Host Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            experiences:experiences(count),
            category:categories(name, icon)
        `)
        .eq('id', hostId)
        .single()

    if (!profile) {
        notFound()
    }

    // 2. Fetch Host's Active Experiences
    const { data: experiencesData } = await supabase
        .from('experiences')
        .select('*')
        .eq('host_id', hostId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    const experiences = experiencesData

    // 3. Fetch Host Reviews (Where host is reviewee)
    const totalReviews = experiences?.reduce((acc: number, exp: any) => acc + (exp.review_count || 0), 0) || 0

    // Calculate weighted average
    let totalScore = 0
    if (experiences) {
        experiences.forEach((exp: any) => {
            totalScore += (exp.rating || 0) * (exp.review_count || 0)
        })
    }

    const avgRating = totalReviews > 0 ? totalScore / totalReviews : 0

    // Fetch Host Reviews for display
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            *,
            reviewer:profiles!reviewer_id(full_name, avatar_url)
        `)
        .eq('reviewee_id', hostId)
        .order('created_at', { ascending: false })

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "dateCreated": profile.created_at,
        "mainEntity": {
            "@type": "Person",
            "name": profile.full_name,
            "image": profile.avatar_url,
            "description": profile.bio,
            "jobTitle": "Experience Host",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": profile.city,
                "addressCountry": profile.country
            },
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/WriteAction",
                "userInteractionCount": totalReviews
            }
        },
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
                    "name": profile.full_name,
                    "item": `https://tripzeo.com/host/${hostId}` // Approximate URL, slug unavailable here but acceptable
                }
            ]
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl pb-24 lg:pb-8">
            {/* Visual Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{profile.full_name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Schema.org Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Sidebar: Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-none shadow-lg bg-card/50 backdrop-blur-sm">
                        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                                {/* @ts-ignore - Supabase join type inference */}
                                <AvatarImage src={profile.avatar_url || profile.category?.icon || ''} className="object-cover object-top" />
                                <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || 'H'}</AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {profile.category && (
                                        <Badge variant="outline" className="gap-1">
                                            {/* @ts-ignore - Supabase join type inference */}
                                            {profile.category.name}
                                        </Badge>
                                    )}
                                    {profile.is_verified && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none gap-1 w-fit">
                                            <ShieldCheck className="h-3 w-3" /> Identity Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="w-full space-y-3 text-sm text-left px-2">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                </div>
                                {profile.city && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{profile.city}, {profile.country}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{totalReviews} Reviews ({avgRating.toFixed(1)})</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content: Bio & Experiences */}
                <div className="lg:col-span-3 space-y-10">

                    {/* About Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight">About {profile.full_name?.split(' ')[0]}</h2>
                        <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                            {profile.bio || `Hi, I'm ${profile.full_name}! I love sharing unique experiences with people from all over the world.`}
                        </div>
                    </div>

                    <Separator />

                    {/* Experiences Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Experiences ({experiences?.length || 0})</h2>
                        </div>

                        {experiences && experiences.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {experiences.map((experience: any) => (
                                    <ExperienceCard key={experience.id} experience={experience} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/20 rounded-xl">
                                <p className="text-muted-foreground">No active experiences at the moment.</p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Reviews Section */}
                    {reviews && reviews.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight">What guests are saying</h2>
                            <ReviewList experienceId="" initialReviews={reviews} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
