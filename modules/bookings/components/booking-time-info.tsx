'use client'

import { format, parseISO } from "date-fns"
import { Calendar, Clock } from "lucide-react"

interface BookingTimeInfoProps {
    bookingDate?: string
    startTime?: string | null
    endTime?: string | null
    durationMinutes?: number | null
}

export function BookingTimeInfo({ bookingDate, startTime, endTime, durationMinutes }: BookingTimeInfoProps) {
    if (!bookingDate) return <span className="text-muted-foreground">-</span>

    const date = parseISO(bookingDate)

    // Format: "Nov 10, 2024"
    const formattedDate = format(date, "MMM d, yyyy")

    // Time logic
    // Assuming startTime/endTime are "HH:mm:ss" or "HH:mm" strings
    const formatTime = (timeStr?: string | null) => {
        if (!timeStr) return ""
        try {
            // Append a dummy date to parse the time
            const [hours, minutes] = timeStr.split(':')
            const dateWithTime = new Date()
            dateWithTime.setHours(parseInt(hours), parseInt(minutes))
            return format(dateWithTime, "h:mm a")
        } catch {
            return timeStr
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formattedDate}
            </div>
            {(startTime || durationMinutes) && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                        {startTime ? formatTime(startTime) : ''}
                        {startTime && endTime && ` - ${formatTime(endTime)}`}
                        {durationMinutes && ` (${durationMinutes} min)`}
                    </span>
                </div>
            )}
        </div>
    )
}
