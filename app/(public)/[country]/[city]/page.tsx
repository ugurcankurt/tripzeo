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

    const countrySlug = country.toLowerCase()
    const citySlug = city.toLowerCase()

    return {
        title: `Best Things to Do in ${formattedCity}, ${formattedCountry}`, // Suffix handled by layout template
        description: `Book top-rated tours, activities, and experiences in ${formattedCity}. Explore local guides and hidden gems in ${formattedCountry}.`,
        openGraph: {
            title: `Best Things to Do in ${formattedCity}, ${formattedCountry}`,
            description: `Book top-rated tours, activities, and experiences in ${formattedCity}. Explore local guides and hidden gems in ${formattedCountry}.`,
            url: `https://tripzeo.com/${countrySlug}/${citySlug}`,
            siteName: 'Tripzeo',
            images: [
                {
                    url: `/${countrySlug}/${citySlug}/opengraph-image`,
                    width: 1200,
                    height: 675,
                    alt: `Experiences in ${formattedCity}`
                }
            ]
        },
        alternates: {
            canonical: `/${countrySlug}/${citySlug}`
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
