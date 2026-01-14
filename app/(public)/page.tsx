import { Metadata } from "next"
import { Suspense } from "react"
import { Hero } from "@/components/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { NewArrivals } from "@/components/home/new-arrivals"
import { PopularDestinations } from "@/components/home/popular-destinations"
import { CTABanner } from "@/components/home/cta-banner"
import { CategoryGridSkeleton } from "@/components/skeletons/category-grid-skeleton"
import { ExperienceGridSkeleton } from "@/components/skeletons/experience-grid-skeleton"
import { PopularCitiesSkeleton } from "@/components/skeletons/popular-cities-skeleton"

export const metadata: Metadata = {
    title: "Tripzeo | Discover Unique Local Experiences & Services",
    description: "Discover and book unique local experiences, services and activities hosted by experts. From hair styling to tour guiding, find local professionals on Tripzeo.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Tripzeo | Discover Unique Local Experiences & Services",
        description: "Discover and book unique local experiences, services and activities hosted by experts.",
        url: "https://tripzeo.com",
        siteName: "Tripzeo",
    }
}

export default function HomePage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Tripzeo",
        "url": "https://tripzeo.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://tripzeo.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }

    return (
        <div className="container mx-auto px-4 pb-8 pt-0">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section - Static content, no suspense needed for data */}
            <section className="mb-12">
                <Hero categories={[]} />
            </section>

            {/* Categories Grid */}
            <Suspense fallback={<CategoryGridSkeleton />}>
                <CategoryGrid />
            </Suspense>

            {/* New Arrivals Grid */}
            <Suspense fallback={<ExperienceGridSkeleton count={8} />}>
                <NewArrivals />
            </Suspense>

            {/* CTA Banner */}
            <CTABanner />

            {/* Popular Cities Section */}
            <Suspense fallback={<PopularCitiesSkeleton />}>
                <PopularDestinations />
            </Suspense>
        </div>
    )
}