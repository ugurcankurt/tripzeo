import { createClient } from "@/lib/supabase/server"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { Hero } from "@/components/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import Image from "next/image"
import Link from "next/link"
import { slugify } from "@/lib/utils"

export default async function HomePage() {
    const supabase = await createClient()

    // Calculate date for 5 days ago
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    // Fetch latest active experiences (last 5 days)
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
        .gte('created_at', fiveDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(4)

    // Fetch random experiences for Hero Slider
    const { data: heroExperiencesData } = await supabase
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

    // Pick one experience to be the "Featured" one in the UI
    const featuredExperience = heroExperiencesData && heroExperiencesData.length > 0
        ? heroExperiencesData[0]
        : null

    // Fetch Categories for Hero
    const { data: categoriesData } = await supabase
        .from('categories')
        .select('name, icon, slug')
        .eq('is_active', true)
        .order('name')
        .limit(8)

    const heroCategories = categoriesData || []

    const { data: profiles } = await supabase
        .from('profiles')
        .select('avatar_url')
        .not('avatar_url', 'is', null)
        .limit(3)

    const userAvatars = profiles?.map(p => p.avatar_url).filter(Boolean) as string[] || []

    // 4. Popular Cities Data (Dynamic from Experience Counts)
    // Fetch all active experiences (lightweight select) to aggregate popularity
    // For scaling, this should eventually be a Database View or RPC function
    const { data: allExperiences } = await supabase
        .from('experiences')
        .select('location_city, location_country, images')
        .eq('is_active', true)

    // Aggregate counts by city
    const cityStats: Record<string, { count: number, country: string, image: string }> = {}

    if (allExperiences) {
        allExperiences.forEach(exp => {
            if (exp.location_city && exp.location_country) {
                // Normalize key for aggregation (e.g. "Istanbul-Turkey")
                const key = `${exp.location_city}-${exp.location_country}`

                if (!cityStats[key]) {
                    cityStats[key] = {
                        count: 0,
                        country: exp.location_country,
                        image: exp.images?.[0] || '/images/placeholders/city-placeholder.jpg'
                    }
                }

                cityStats[key].count += 1

                // Keep the image from the latest experience (since we loop essentially in arbitrary fetch order, 
                // but usually CreatedAt desc if specified. Here we didn't specify order, so let's stick with first found or overwrite?)
                // Actually, let's keep the first valid image found to ensure we have one.
                if (cityStats[key].image.includes('placeholder') && exp.images?.[0]) {
                    cityStats[key].image = exp.images[0]
                }
            }
        })
    }

    // Convert to array, sort by count, take top 5
    const POPULAR_CITIES = Object.entries(cityStats)
        .map(([key, stat]) => ({
            name: key.split('-')[0], // Extract City Name back from key or use stat (safer to use key part if consistent)
            // Better: use the original city string split? Or just store city name in stats object.
            // Let's refine the stats object.
            city: key.split('-')[0],
            country: stat.country,
            image: stat.image,
            count: stat.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)


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
            {/* Hero Section */}
            <section className="mb-12">
                <Hero
                    categories={heroCategories}
                    userAvatars={userAvatars}
                />
            </section>

            {/* Categoris Grid */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Browse by Service</h2>
                <CategoryGrid />
            </section>

            {/* New Arrivals Grid */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">New Arrivals</h2>
                        <p className="text-muted-foreground mt-1">Check out the latest experiences added in the last 5 days</p>
                    </div>
                </div>

                {experiences && experiences.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {experiences.map((exp: any) => (
                            <ExperienceCard key={exp.id} experience={exp} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No new experiences added in the last 5 days.</p>
                    </div>
                )}
            </section>

            {/* Popular Cities Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Popular Destinations</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {POPULAR_CITIES.map((city) => (
                        <Link
                            key={`${city.city}-${city.country}`}
                            href={`/${slugify(city.country)}/${slugify(city.city)}`}
                            className="relative group cursor-pointer overflow-hidden rounded-xl aspect-[3/4] bg-muted block"
                        >
                            <Image
                                src={city.image}
                                alt={city.city}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 20vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                <h3 className="font-bold text-lg">{city.city}</h3>
                                <p className="text-sm opacity-80">{city.country}</p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-primary/20 backdrop-blur-sm rounded text-xs font-medium border border-primary/30 text-primary-foreground">
                                    {city.count} Experiences
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}