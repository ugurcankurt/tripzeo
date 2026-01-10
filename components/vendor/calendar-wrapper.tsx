import { CalendarClient } from "@/app/(dashboard)/vendor/calendar/client-view"
import { getHostExperiences, getCalendarData } from "@/modules/calendar/actions"
import { Loader2 } from "lucide-react"
import { requireHost } from "@/lib/auth/guards"
import { CalendarBooking, CalendarBlockedDate } from "@/modules/calendar/types"
import Link from "next/link"

export async function CalendarWrapper() {
    const today = new Date()
    const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1))

    const { user } = await requireHost()

    const [experiences, calendarData] = await Promise.all([
        getHostExperiences(),
        getCalendarData(today, nextYear)
    ])

    if (!experiences || experiences.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="p-4 rounded-full bg-muted">
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">No Experiences Found</h2>
                <p className="text-muted-foreground max-w-md">
                    You haven&apos;t listed any experiences yet. Create an experience to start managing your availability.
                </p>
                <div className="pt-4">
                    <Link href="/vendor/products/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Create Experience
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Availability Calendar</h2>
                    <p className="text-muted-foreground">
                        Manage your schedule, block dates, and view upcoming bookings.
                    </p>
                </div>
            </div>

            <CalendarClient
                experiences={experiences || []}
                initialBookings={calendarData.bookings as CalendarBooking[]}
                initialBlockedDates={calendarData.blockedDates as CalendarBlockedDate[]}
                hostId={user.id}
            />
        </div>
    )
}
