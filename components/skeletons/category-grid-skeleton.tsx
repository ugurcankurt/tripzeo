import { CategoryCardSkeleton } from "./category-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryGridSkeleton() {
    return (
        <div className="space-y-6 mb-16">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="basis-1/2 md:basis-1/4 lg:basis-1/5 shrink-0">
                        <CategoryCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    )
}
