import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export function ExperienceDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
            {/* Breadcrumbs */}
            <div className="mb-6 flex gap-2 items-center">
                <Skeleton className="h-4 w-12" />
                <span className="text-muted-foreground">/</span>
                <Skeleton className="h-4 w-24" />
                <span className="text-muted-foreground">/</span>
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Gallery */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] rounded-xl overflow-hidden">
                <Skeleton className="md:col-span-2 h-full w-full" />
                <div className="hidden md:grid col-span-1 gap-2 h-full">
                    <Skeleton className="h-full w-full" />
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="hidden md:grid col-span-1 gap-2 h-full">
                    <Skeleton className="h-full w-full" />
                    <Skeleton className="h-full w-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Content */}
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <Skeleton className="h-10 w-3/4 mb-4" />
                        <div className="flex flex-wrap gap-4">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>

                    <Separator />

                    {/* Host Info */}
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>

                    {/* Reviews */}
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-40" />
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex gap-2 items-center">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Booking Card */}
                <div className="hidden lg:block">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex justify-between items-end">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-md" />
                            <Skeleton className="h-12 w-full rounded-md" />
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-10" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-10" />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
