import { Suspense } from "react"
import { CalendarWrapper } from "@/components/vendor/calendar-wrapper"
import { CalendarSkeleton } from "@/components/skeletons/calendar-skeleton"
import { requireHost } from "@/lib/auth/guards"

export const metadata = {
    title: "Availability Calendar | Vendor Dashboard",
    description: "Manage your experience availability and view bookings."
}

export default async function VendorCalendarPage() {
    await requireHost()

    return (
        <Suspense fallback={<CalendarSkeleton />}>
            <CalendarWrapper />
        </Suspense>
    )
}
