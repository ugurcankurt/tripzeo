import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function CityLandingSkeleton() {
    return (
        <div className="container mx-auto px-4 py-4">
            {/* Breadcrumb */}
            <div className="mb-6 flex gap-2 items-center">
                <Skeleton className="h-4 w-12" />
                <span className="text-muted-foreground">/</span>
                <Skeleton className="h-4 w-32" />
            </div>

            {/* Header */}
            <div className="mb-12">
                <Skeleton className="h-10 w-96 mb-4" />
                <Skeleton className="h-6 w-full max-w-2xl" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[250px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
