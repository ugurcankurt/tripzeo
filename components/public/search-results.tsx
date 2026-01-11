import { createClient } from "@/lib/supabase/server"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { CategoryGrid } from "@/components/home/category-grid"
import { redirect } from "next/navigation"
import { ViewItemListTracker } from "@/components/analytics/view-item-list-tracker"

interface SearchResultsProps {
    q?: string
    category?: string
}

export async function SearchResults({ q, category }: SearchResultsProps) {
    const supabase = await createClient()

    let query = supabase
        .from('experiences')
        .select(`
            *,
            host:profiles(full_name, avatar_url)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (q) {
        // Smart Redirect Logic
        // We fetch all active cities and compare slugs in JS to handle international chars (İ vs i) better than standard SQL ilike
        const { data: allCities } = await supabase
            .from('experiences')
            .select('location_country, location_city')
            .eq('is_active', true)

        if (allCities) {
            const { slugify } = await import("@/lib/utils")
            const searchSlug = slugify(q)

            // Find first matching city
            const cityMatch = allCities.find(c => slugify(c.location_city) === searchSlug)

            if (cityMatch && cityMatch.location_country && cityMatch.location_city) {
                const countrySlug = slugify(cityMatch.location_country)
                const citySlug = slugify(cityMatch.location_city)
                redirect(`/${countrySlug}/${citySlug}`)
            }

            // Smart Redirect: Check if the query matches a known category
            const { data: allCategories } = await supabase
                .from('categories')
                .select('name, slug')
                .eq('is_active', true)

            if (allCategories) {
                const categoryMatch = allCategories.find(c => slugify(c.name) === searchSlug || c.slug === searchSlug)
                if (categoryMatch) {
                    redirect(`/category/${categoryMatch.slug}`)
                }
            }
        }

        // Simple text search on title or location or description
        query = query.or(`title.ilike.%${q}%,location_city.ilike.%${q}%,location_country.ilike.%${q}%,description.ilike.%${q}%`)
    }

    if (category) {
        // Redirection to Programmatic SEO Category Page
        redirect(`/category/${category}`)
    }

    const { data: experiences, error } = await query

    if (error) console.error('Search Error:', error)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">
                {q ? `Results for "${q}"` : category ? `${category} Experiences` : "All Experiences"}
            </h1>

            {!q && !category && (
                <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-4">Browse Categories</h2>
                    <CategoryGrid />
                </div>
            )}

            {experiences && experiences.length > 0 ? (
                <>
                    <ViewItemListTracker
                        items={experiences.map((exp: any, index: number) => ({
                            item_id: exp.id,
                            item_name: exp.title,
                            index: index,
                            price: exp.price,
                            item_brand: exp.host?.full_name || 'Tripzeo Host',
                            item_category: exp.category || 'General',
                            item_list_name: q ? 'Search Results' : category ? 'Category Results' : 'All Experiences',
                            item_list_id: q ? 'search_results' : category ? 'category_results' : 'all_experiences',
                            location_id: exp.location_city
                        }))}
                        listName={q ? 'Search Results' : category ? 'Category Results' : 'All Experiences'}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        {experiences.map((exp: any) => (
                            <ExperienceCard key={exp.id} experience={exp} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-muted-foreground text-lg mb-4">No experiences found matching your criteria.</p>
                    <p className="text-sm text-muted-foreground">Try a different search term or browse our categories.</p>
                    <div className="mt-8 max-w-4xl mx-auto">
                        <CategoryGrid />
                    </div>
                </div>
            )}
        </div>
    )
}
