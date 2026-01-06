import { Tables } from "@/types/supabase"

type BookingRow = Tables<'bookings'>
type AvailabilityRow = Tables<'experience_availability'>
type ExperienceRow = Tables<'experiences'>

export interface CalendarExperience {
    id: string
    title: string
}

export type CalendarBooking = Pick<BookingRow, 'id' | 'booking_date' | 'status' | 'attendees_count'> & {
    experiences: Pick<ExperienceRow, 'id' | 'title'> | null
}

export type CalendarBlockedDate = Pick<AvailabilityRow, 'id' | 'date' | 'is_blocked' | 'experience_id'> & {
    experiences?: Pick<ExperienceRow, 'id' | 'title'> | null
}

export interface CalendarClientProps {
    experiences: CalendarExperience[]
    initialBookings: CalendarBooking[]
    initialBlockedDates: CalendarBlockedDate[]
    hostId: string
}
