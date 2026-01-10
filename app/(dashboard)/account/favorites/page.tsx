import { Suspense } from "react"
import { ExperienceGridSkeleton } from "@/components/skeletons/experience-grid-skeleton"
import { FavoritesList } from "@/components/account/favorites-list"

export default function FavoritesPage() {
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

            <Suspense fallback={<ExperienceGridSkeleton />}>
                <FavoritesList />
            </Suspense>
        </div>
    )
}
