import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import { HostProfileContent } from "@/components/public/host-profile-content"
import { HostProfileSkeleton } from "@/components/skeletons/host-profile-skeleton"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const supabase = createClient()
    const { slug } = await params
    const hostId = slug.slice(-36)

    const { data: profile } = await (await supabase)
        .from('profiles')
        .select('full_name, bio, avatar_url, category:categories(name)')
        .eq('id', hostId)
        .single()

    if (!profile) {
        return {
            title: 'Host Not Found',
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const categoryName = profile.category?.name || 'Experience Host'
    const title = `${profile.full_name} - ${categoryName}`
    const description = profile.bio?.slice(0, 160) || `Book unique experiences with ${profile.full_name} on Tripzeo.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            // Images are automatically handled by opengraph-image.tsx
        },
    }
}

export default async function HostProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const hostId = slug.slice(-36)

    return (
        <Suspense fallback={<HostProfileSkeleton />}>
            <HostProfileContent hostId={hostId} />
        </Suspense>
    )
}
