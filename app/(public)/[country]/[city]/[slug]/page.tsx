import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from 'next'
import { ExperienceDetailContent } from "@/components/public/experience-detail-content"
import { ExperienceDetailSkeleton } from "@/components/skeletons/experience-detail-skeleton"

export async function generateMetadata({ params }: { params: Promise<{ country: string, city: string, slug: string }> }): Promise<Metadata> {
    const supabase = await createClient()
    const { slug } = await params
    const experienceId = slug.slice(-36) // Extract ID from slug

    const { data: experience } = await supabase
        .from('experiences')
        .select('title, description, location_city, location_country, images')
        .eq('id', experienceId)
        .single()

    if (!experience) {
        return {
            title: 'Experience Not Found',
        }
    }

    return {
        title: `${experience.title} in ${experience.location_city}`, // Suffix handled by layout template
        description: experience.description?.slice(0, 160) || `Book ${experience.title} in ${experience.location_city}, ${experience.location_country}.`,
        openGraph: {
            title: experience.title,
            description: experience.description?.slice(0, 160),
            url: `https://tripzeo.com/${experience.location_country}/${experience.location_city}/${slug}`,
            images: experience.images && experience.images.length > 0 ? [experience.images[0]] : [],
        },
    }
}

export default async function ExperiencePage({ params }: { params: Promise<{ country: string, city: string, slug: string }> }) {
    const { country, city, slug } = await params

    return (
        <Suspense fallback={<ExperienceDetailSkeleton />}>
            <ExperienceDetailContent country={country} city={city} slug={slug} />
        </Suspense>
    )
}
