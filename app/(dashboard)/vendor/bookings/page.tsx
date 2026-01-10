import { Suspense } from "react"
import { VendorBookingsList } from "@/components/vendor/bookings-list"
import { VendorBookingsSkeleton } from "@/components/skeletons/vendor-bookings-skeleton"
import { requireHost } from "@/lib/auth/guards"
import { ErrorState } from "@/components/shared/error-state"

export default async function VendorBookingsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const chatBookingId = typeof params.chat === 'string' ? params.chat : null

    try {
        await requireHost()
    } catch (error: unknown) {
        // Safe check for error object
        const isHostError = error && typeof error === 'object' && 'message' in error && (error as any).message === 'HOST_ACCESS_REQUIRED';

        if (isHostError) {
            return (
                <ErrorState
                    title="Unauthorized Access"
                    message="You must have a Host (Vendor) account to view this page."
                    action={{
                        label: "Go to Dashboard",
                        href: "/"
                    }}
                />
            )
        }
        throw error
    }

    return (
        <Suspense fallback={<VendorBookingsSkeleton />}>
            <VendorBookingsList />
        </Suspense>
    )
}
