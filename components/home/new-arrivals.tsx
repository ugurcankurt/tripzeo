import { createClient } from "@/lib/supabase/server"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"

export async function NewArrivals() {
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

    return (
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
    )
}
