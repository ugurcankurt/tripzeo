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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Availability Calendar</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your schedule, block dates, and view upcoming bookings.
                </p>
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

