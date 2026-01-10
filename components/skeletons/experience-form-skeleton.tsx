import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function ExperienceFormSkeleton() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto py-8">
            {/* Steps Header */}
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-2 w-8" />
                    <Skeleton className="h-2 w-8" />
                    <Skeleton className="h-2 w-8" />
                    <Skeleton className="h-2 w-8" />
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    )
}
