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
// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Note: generateStaticParams removed to prevent build-time static generation attempt

export default async function CityPage({ params }: CityPageProps) {
    const { country, city } = await params

    return (
        <Suspense fallback={<CityLandingSkeleton />}>
            <CityLandingContent country={country} city={city} />
        </Suspense>
    )
}
