import { Suspense } from "react"
import { Hero } from "@/components/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { NewArrivals } from "@/components/home/new-arrivals"
import { PopularDestinations } from "@/components/home/popular-destinations"
import { CTABanner } from "@/components/home/cta-banner"
import { CategoryGridSkeleton } from "@/components/skeletons/category-grid-skeleton"
import { ExperienceGridSkeleton } from "@/components/skeletons/experience-grid-skeleton"
import { PopularCitiesSkeleton } from "@/components/skeletons/popular-cities-skeleton"

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
            <section className="mb-16" aria-labelledby="browse-heading">
                <h2 id="browse-heading" className="text-2xl font-bold mb-6">Browse by Service</h2>
                <Suspense fallback={<CategoryGridSkeleton />}>
                    <CategoryGrid />
                </Suspense>
            </section>

            {/* New Arrivals Grid */}
            <section className="mb-16" aria-labelledby="new-arrivals-heading">
                <Suspense fallback={<ExperienceGridSkeleton count={8} />}>
                    <NewArrivals />
                </Suspense>
            </section>

            {/* CTA Banner */}
            <CTABanner />

            {/* Popular Cities Section */}
            <section aria-labelledby="popular-heading">
                <Suspense fallback={<PopularCitiesSkeleton />}>
                    <PopularDestinations />
                </Suspense>
            </section>
        </div>
    )
}