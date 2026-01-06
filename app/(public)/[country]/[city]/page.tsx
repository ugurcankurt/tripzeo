/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { CategoryGrid } from "@/components/home/category-grid"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, MapPin } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const revalidate = 3600 // Revalidate every hour

interface CityPageProps {
    params: Promise<{
        country: string
        city: string
    }>
}

const unslugify = (slug: string) => slug.replace(/-/g, ' ')

export async function generateMetadata({ params }: CityPageProps) {
    const { country, city } = await params
    const cityName = unslugify(city)
    const countryName = unslugify(country)

    // Capitalize for display
    const formattedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1)
    const formattedCountry = countryName.charAt(0).toUpperCase() + countryName.slice(1)

    return {
        title: `Best Things to Do in ${formattedCity}, ${formattedCountry} | Tripzeo`,
        description: `Book top-rated tours, activities, and experiences in ${formattedCity}. Explore local guides and hidden gems in ${formattedCountry}.`,
        alternates: {
            canonical: `https://tripzeo.com/${country}/${city}`
        }
    }
}

// Programmatic SEO: Generate static paths for known cities
export async function generateStaticParams() {
    // GenerateStaticParams runs at build time and cannot use cookies()
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch unique active cities
    // Note: Supabase doesn't support distinct on specific columns easily via JS client in one go without raw query sometimes,
    // but we can fetch all and dedup in JS for build time (usually fine for moderate dataset).
    // Or just fetch active experiences and map their locations.
    const { data: experiences } = await supabase
        .from('experiences')
        .select('location_country, location_city')
        .eq('is_active', true)

    if (!experiences) return []

    // Create unique set of country/city pairs
    const uniqueLocations = new Set<string>()
    const paths: { country: string, city: string }[] = []

    experiences.forEach(exp => {
        if (exp.location_country && exp.location_city) {
            const countrySlug = exp.location_country.toLowerCase().replace(/\s+/g, '-')
            const citySlug = exp.location_city.toLowerCase().replace(/\s+/g, '-')
            const key = `${countrySlug}/${citySlug}`

            if (!uniqueLocations.has(key)) {
                uniqueLocations.add(key)
                paths.push({ country: countrySlug, city: citySlug })
            }
        }
    })

    return paths
}

export default async function CityPage({ params }: CityPageProps) {
    const supabase = await createClient()
    const { country, city } = await params

    const cityName = unslugify(city)
    // const countryName = unslugify(country) // Can be used for stricter filtering

    // 1. Resolve true city name from database (handling special characters like İstanbul vs istanbul)
    // Since we don't store slugs, we fetch potential matches or all active locations and match in JS
    const { data: allLocations } = await supabase
        .from('experiences')
        .select('location_city')
        .eq('is_active', true)

    let exactCityName = cityName // Fallback to unslugified version

    if (allLocations) {
        const { slugify } = await import("@/lib/utils")
        // Find the database value that produces the current slug
        const match = allLocations.find(l => slugify(l.location_city) === city)
        if (match) {
            exactCityName = match.location_city
        }
    }

    // Fetch experiences matching the city
    // We use eq with the resolved exact name for precision
    const { data: experiences } = await supabase
        .from('experiences')
        .select(`
            *,
            host:profiles(full_name, avatar_url)
        `)
        .eq('is_active', true)
        .eq('location_city', exactCityName)
        .order('created_at', { ascending: false })

    const formattedCity = exactCityName // Use the Database version for display (e.g. İstanbul)

    if (!experiences || experiences.length === 0) {
        // Option 1: Show 404
        // notFound()

        // Option 2: Show empty state (Better for SEO if we want to keep the page indexable but show 'coming soon')
        // For Programmatic SEO, usually thin pages are bad, but 404 is worse if we linked to it.
        // Let's show empty state with categories.
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
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
                        "name": formattedCity,
                        "item": `https://tripzeo.com/${country}/${city}`
                    }
                ]
            },
            {
                "@type": "ItemList",
                "name": `Top Experiences in ${formattedCity}`,
                "description": `Best tours and activities in ${formattedCity}`,
                "itemListElement": experiences?.map((exp: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "TouristTrip",
                        "name": exp.title,
                        "description": exp.description,
                        "url": `https://tripzeo.com/experience/${exp.id}`, // Using ID as slug is not defined in type
                        "provider": {
                            "@type": "Organization",
                            "name": "Tripzeo"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": exp.price,
                            "priceCurrency": exp.currency || "USD"
                        }
                    }
                })) || []
            }
        ]
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Visual Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{formattedCity}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    Top Experiences in <span className="text-primary">{formattedCity}</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Discover local guides, unique activities, and authentic things to do in {formattedCity}.
                    Book instantly with Tripzeo.
                </p>
            </div>

            {/* Schema.org Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {experiences && experiences.length > 0 ? (
                    experiences.map((exp: any) => (
                        <ExperienceCard key={exp.id} experience={exp} />
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-muted/30 rounded-xl border border-dashed">
                        <h3 className="text-2xl font-semibold mb-2">No experiences found in {formattedCity} yet</h3>
                        <p className="text-muted-foreground mb-8">
                            We are currently expanding to {formattedCity}. Check back soon or browse other destinations.
                        </p>
                        <CategoryGrid />
                    </div>
                )}
            </div>

            {/* SEO Content Section */}
            {experiences && experiences.length > 0 && (
                <div className="mt-24">
                    <Card className="bg-gradient-to-br from-muted/50 via-muted/30 to-background border-muted/60 shadow-sm overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 opacity-[0.03] pointer-events-none">
                            <MapPin className="w-96 h-96" />
                        </div>

                        <CardContent className="p-8 md:p-12 relative z-10">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Travel Guide</span>
                                </div>

                                <h2 className="text-3xl font-bold mb-6 tracking-tight">
                                    Explore the Best of <span className="text-primary">{formattedCity}</span>
                                </h2>

                                <div className="prose prose-lg text-muted-foreground/90 leading-relaxed">
                                    <p>
                                        Looking for unique things to do in <span className="font-semibold text-foreground">{formattedCity}</span>?
                                        Tripzeo offers a curated selection of tours and activities hosted by passionate locals.
                                    </p>
                                    <p className="mt-4">
                                        Whether you&apos;re planning a weekend getaway or a long vacation, our experiences are designed to show you
                                        the authentic side of {formattedCity}. Skip the tourist traps and discover hidden gems, local favorites,
                                        and unforgettable adventures.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
