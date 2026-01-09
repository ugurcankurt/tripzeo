import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/guards"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { Tables } from "@/types/supabase"
import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { user } = await requireAuth()

    const { data: favorites } = await supabase
        .from('favorites')
        .select(`
            experience_id,
            experiences (
                id,
                title,
                price,
                currency,
                location_city,
                location_country,
                images,
                rating,
                review_count
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const experiences = favorites?.map(f => f.experiences).filter(Boolean) as any[] || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Favorites</h2>
                    <p className="text-muted-foreground">
                        Keep track of the experiences you love.
                    </p>
                </div>
            </div>

            {experiences.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {experiences.map((exp) => (
                        <ExperienceCard key={exp.id} experience={exp} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 border rounded-lg bg-muted/20">
                    <div className="bg-background p-4 rounded-full shadow-sm">
                        <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold">No favorites yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Start exploring and save the experiences you like to your wishlist.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/">Explore Experiences</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
