import { Skeleton } from "@/components/ui/skeleton"

export function ProfileFormSkeleton() {
    return (
        <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-32 w-full" />
            </div>

            {/* Horizontal Rule */}
            <div className="pt-4 border-t space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
}
