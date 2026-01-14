import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripzeo.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()

    // 1. Static Routes
    // 1. Static Routes with specific priorities
    const routes = [
        { url: '', priority: 1, changeFrequency: 'daily' as const },
        { url: '/search', priority: 0.8, changeFrequency: 'daily' as const },
        { url: '/become-a-host', priority: 0.9, changeFrequency: 'weekly' as const },
        { url: '/become-a-partner', priority: 0.7, changeFrequency: 'weekly' as const },
        { url: '/login', priority: 0.5, changeFrequency: 'yearly' as const },
        { url: '/register', priority: 0.5, changeFrequency: 'yearly' as const },
        { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
        { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    ].map((route) => ({
        url: `${baseUrl}${route.url}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }))

    // 2. Fetch Active Experiences
    const { data: experiences } = await supabase
        .from('experiences')
        .select('id, title, location_country, location_city, updated_at')
        .eq('is_active', true)

    const experienceRoutes = (experiences || []).map((exp) => {
        const countrySlug = slugify(exp.location_country || 'turkey') // Default fallback if missing
        const citySlug = slugify(exp.location_city)
        const titleSlug = slugify(exp.title)

        return {
            url: `${baseUrl}/${countrySlug}/${citySlug}/${titleSlug}-${exp.id}`,
            lastModified: new Date(exp.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }
    })

    // 3. Fetch Active Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true)

    const categoryRoutes = (categories || []).map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(cat.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // 4. Derive Active Cities (Country/City pages)
    // Since we don't have a separate cities table, we derive from active experiences
    const citySet = new Set<string>()
    const cityRoutes: MetadataRoute.Sitemap = []

    if (experiences) {
        experiences.forEach(exp => {
            if (exp.location_country && exp.location_city) {
                const countrySlug = slugify(exp.location_country)
                const citySlug = slugify(exp.location_city)
                const key = `${countrySlug}/${citySlug}`

                if (!citySet.has(key)) {
                    citySet.add(key)
                    cityRoutes.push({
                        url: `${baseUrl}/${countrySlug}/${citySlug}`,
                        lastModified: new Date(), // Could track latest experience update per city ideally
                        changeFrequency: 'daily' as const,
                        priority: 0.8,
                    })
                }
            }
        })
    }

    // 5. Fetch Active Hosts (who have active experiences)
    const activeHostIds = [...new Set((experiences || []).map(e => (e as any).host_id).filter(Boolean))] // extract host_ids from fetched experiences if available?
    // Wait, previous experience fetch didn't select host_id. I should add it to the select or do a separate query.
    // Doing a separate query to be safe and clean.

    const { data: activeHostsExperiences } = await supabase
        .from('experiences')
        .select('host_id')
        .eq('is_active', true)

    const uniqueHostIds = [...new Set(activeHostsExperiences?.map(e => e.host_id).filter(Boolean) || [])]

    let hostRoutes: MetadataRoute.Sitemap = []

    if (uniqueHostIds.length > 0) {
        const { data: hosts } = await supabase
            .from('profiles')
            .select('id, full_name, updated_at')
            .in('id', uniqueHostIds)

        hostRoutes = (hosts || []).map((host) => ({
            url: `${baseUrl}/host/${slugify(host.full_name || 'host')}-${host.id}`,
            lastModified: new Date(host.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))
    }

    return [...routes, ...experienceRoutes, ...categoryRoutes, ...cityRoutes, ...hostRoutes]
}
