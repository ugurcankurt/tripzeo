import { ExperienceCardSkeleton } from "./experience-card-skeleton"

interface GridSkeletonProps {
    count?: number
}

export function ExperienceGridSkeleton({ count = 4 }: GridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ExperienceCardSkeleton key={i} />
            ))}
        </div>
    )
}
