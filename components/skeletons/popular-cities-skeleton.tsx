import { CityCardSkeleton } from "./city-card-skeleton"

export function PopularCitiesSkeleton() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <CityCardSkeleton key={i} />
                ))}
            </div>
        </section>
    )
}
