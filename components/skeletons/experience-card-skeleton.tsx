import { Skeleton } from "@/components/ui/skeleton"

export function ExperienceCardSkeleton() {
    return (
        <article className="space-y-4">
            {/* Image Skeleton */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] ring-1 ring-border">
                <Skeleton className="h-full w-full" />
            </div>

            {/* Content Skeleton */}
            <div className="space-y-2">
                {/* Location */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>

                {/* Title */}
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-3 w-12" />
                </div>
            </div>
        </article>
    )
}
