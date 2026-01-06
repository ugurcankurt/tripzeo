import { createClient } from "@/lib/supabase/server"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { Hero } from "@/components/hero"
import { CategoryGrid } from "@/components/home/category-grid"

export default async function HomePage() {
    const supabase = await createClient()

    // Fetch latest active experiences
    const { data: experiences } = await supabase
        .from('experiences')
        .select(`
            id,
            title,
            price,
            currency,
            location_city,
            location_country,
            images,
            rating,
            review_count
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch random experiences for Hero Slider
    const { data: heroExperiencesData } = await supabase
        .from('experiences')
        .select('id, title, images')
        .eq('is_active', true)
        .not('images', 'is', null)
        .limit(20)

    const heroSlides = (heroExperiencesData || [])
        .filter(exp => exp.images && exp.images.length > 0)
        .map(exp => ({
            id: exp.id,
            title: exp.title,
            image: exp.images![0]
        }))
        // eslint-disable-next-line
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)

    // Fetch Categories for Hero
    const { data: categoriesData } = await supabase
        .from('categories')
        .select('name, icon, slug')
        .eq('is_active', true)
        .order('name')
        .limit(8)

    const heroCategories = categoriesData || []




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
        <div className="container mx-auto px-4 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <section className="mb-12">
                <Hero slides={heroSlides} categories={heroCategories} />
            </section>

            {/* Categoris Grid */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Browse by Service</h2>
                <CategoryGrid />
            </section>

            {/* Grid */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">New Arrivals</h2>
                </div>

                {experiences && experiences.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {experiences.map((exp: any) => (
                            <ExperienceCard key={exp.id} experience={exp} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No experiences added yet.</p>
                    </div>
                )}
            </section>
        </div>
    )
}