import { Suspense } from "react"
import { CityLandingContent } from "@/components/public/city-landing-content"
import { CityLandingSkeleton } from "@/components/skeletons/city-landing-skeleton"

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
        title: `Best Things to Do in ${formattedCity}, ${formattedCountry}`, // Suffix handled by layout template
        description: `Book top-rated tours, activities, and experiences in ${formattedCity}. Explore local guides and hidden gems in ${formattedCountry}.`,
        openGraph: {
            url: `https://tripzeo.com/${country}/${city}`,
        },
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
    const { country, city } = await params

    return (
        <Suspense fallback={<CityLandingSkeleton />}>
            <CityLandingContent country={country} city={city} />
        </Suspense>
    )
}
