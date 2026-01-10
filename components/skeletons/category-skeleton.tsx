import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function CategoryCardSkeleton() {
    return (
        <Card className="h-full ring-1 ring-foreground/10 bg-card min-h-[160px] relative rounded-2xl overflow-hidden">
            <div className="p-1 h-full flex flex-col items-start justify-end">
                {/* Icon/Image Placeholder */}
                <div className="absolute -top-10 -right-4 w-24 h-32 md:-top-12 md:-right-6 md:w-36 md:h-44">
                    <Skeleton className="h-full w-full rounded-none" />
                </div>

                {/* Text Content */}
                <div className="p-5 w-full relative z-10 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </div>
        </Card>
    )
}
