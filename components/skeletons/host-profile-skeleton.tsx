import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function HostProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl pb-24 lg:pb-8">
            {/* Visual Breadcrumbs */}
            <div className="mb-6 flex gap-2 items-center">
                <Skeleton className="h-4 w-12" />
                <span className="text-muted-foreground">/</span>
                <Skeleton className="h-4 w-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-none shadow-lg bg-card/50">
                        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                            <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />

                            <div className="space-y-2 w-full flex flex-col items-center">
                                <Skeleton className="h-8 w-48" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                </div>
                            </div>

                            <Separator />

                            <div className="w-full space-y-3 px-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-3 space-y-10">
                    {/* About Section */}
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>

                    <Separator />

                    {/* Experiences Section */}
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-40" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col space-y-3">
                                    <Skeleton className="h-[250px] w-full rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
