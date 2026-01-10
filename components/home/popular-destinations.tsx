import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { slugify } from "@/lib/utils"

export async function PopularDestinations() {
    const supabase = await createClient()

    // 4. Popular Cities Data (Dynamic from Experience Counts)
    const { data: allExperiences } = await supabase
        .from('experiences')
        .select('location_city, location_country, images')
        .eq('is_active', true)

    // Aggregate counts by city
    const cityStats: Record<string, { count: number, country: string, image: string }> = {}

    if (allExperiences) {
        allExperiences.forEach(exp => {
            if (exp.location_city && exp.location_country) {
                const key = `${exp.location_city}-${exp.location_country}`

                if (!cityStats[key]) {
                    cityStats[key] = {
                        count: 0,
                        country: exp.location_country,
                        image: exp.images?.[0] || '/images/placeholders/city-placeholder.jpg'
                    }
                }

                cityStats[key].count += 1

                if (cityStats[key].image.includes('placeholder') && exp.images?.[0]) {
                    cityStats[key].image = exp.images[0]
                }
            }
        })
    }

    const POPULAR_CITIES = Object.entries(cityStats)
        .map(([key, stat]) => ({
            city: key.split('-')[0],
            country: stat.country,
            image: stat.image,
            count: stat.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return (
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
    )
}
