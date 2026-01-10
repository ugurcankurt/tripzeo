import { Skeleton } from "@/components/ui/skeleton"

export function CityCardSkeleton() {
    return (
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
            <Skeleton className="h-full w-full" />
            <div className="absolute bottom-4 left-4 z-20 space-y-2 w-3/4">
                <Skeleton className="h-6 w-1/2 bg-white/20" />
                <Skeleton className="h-4 w-1/3 bg-white/20" />
            </div>
        </div>
    )
}
