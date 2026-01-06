import { Suspense } from "react"
import { CalendarClient } from "./client-view"
import { getHostExperiences, getCalendarData } from "@/modules/calendar/actions"
import { Loader2 } from "lucide-react"
import { requireHost } from "@/lib/auth/guards"
import { CalendarBooking, CalendarBlockedDate } from "@/modules/calendar/types"

export const metadata = {
    title: "Availability Calendar | Vendor Dashboard",
    description: "Manage your experience availability and view bookings."
}

export default async function VendorCalendarPage() {
    // Determine data range (e.g. current month +/- 1 year, or just fetch all active future bookings)
    // For simplicity, let's fetch a wide range (e.g. from today to next year)
    // or just fetch all relevant data and let client filter? 
    // Optimization: ideally client requests month data, but for MVP load 3-6 months.

    const today = new Date()
    const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1))

    // Ensure host
    const { user } = await requireHost()

    // Run fetches in parallel
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
                    You haven't listed any experiences yet. Create an experience to start managing your availability.
                </p>
                <div className="pt-4">
                    <a href="/vendor/products/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Create Experience
                    </a>
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

            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <CalendarClient
                    experiences={experiences || []}
                    initialBookings={calendarData.bookings as CalendarBooking[]}
                    initialBlockedDates={calendarData.blockedDates as CalendarBlockedDate[]}
                    hostId={user.id}
                />
            </Suspense>
        </div>
    )
}

