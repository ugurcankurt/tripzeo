import { Tables } from "@/types/supabase"

export type DashboardUser = Pick<Tables<'profiles'>, 'full_name' | 'email' | 'role' | 'created_at'>

export type DashboardBookingSummary = Pick<Tables<'bookings'>, 'total_amount' | 'status' | 'commission_amount'>

export type DashboardBooking = Pick<Tables<'bookings'>, 'id' | 'total_amount' | 'status' | 'created_at'> & {
    user: Pick<Tables<'profiles'>, 'full_name'> | null
}
