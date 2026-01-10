import { Skeleton } from "@/components/ui/skeleton"

export function AuthSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <div className="mx-auto h-8 w-48">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="mx-auto h-4 w-64">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>

            <div className="space-y-4">
                {/* Field 1 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-11 w-full" />
                </div>
                {/* Field 2 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-11 w-full" />
                </div>

                {/* Button */}
                <Skeleton className="h-11 w-full" />
            </div>

            <div className="relative">
                <Skeleton className="h-4 w-full" />
            </div>

            <div className="mx-auto h-4 w-48">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    )
}
