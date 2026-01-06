import { Database, Tables } from './supabase'

type ExperienceRow = Tables<'experiences'>
type ProfileRow = Tables<'profiles'>
type ReviewRow = Tables<'reviews'>

export type ExperienceCardData = Pick<ExperienceRow,
    'id' | 'title' | 'price' | 'currency' | 'location_city' | 'location_country' | 'images' | 'rating' | 'review_count'
> & {
    host?: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null
}

export type VendorExperienceCardData = Pick<ExperienceRow,
    'id' | 'title' | 'description' | 'price' | 'images' | 'location_city' | 'location_country' | 'created_at'
>

export type ExperienceDetailData = ExperienceRow & {
    host: Pick<ProfileRow, 'full_name' | 'avatar_url' | 'bio'> | null
}

export interface MonthlyData {
    name: string // Month name (e.g. "Jan")
    revenue: number // Total GMV
    commission: number // Net Revenue
    payout: number // Amount paid to hosts
}

export interface WiseRecipient {
    profileId: string
    accountHolderName: string
    currency: string
    type: 'iban'
    details: {
        legalType: 'PRIVATE' | 'BUSINESS'
        iban: string
        address?: {
            city: string
            country: string
            firstLine: string
            postCode: string
        }
    }
}

export interface ExperienceFormData extends Omit<Database['public']['Tables']['experiences']['Insert'], 'id' | 'created_at' | 'updated_at' | 'host_id' | 'rating' | 'review_count' | 'images'> {
    images: (string | File)[]
    id?: string
}

export type ReviewData = Pick<ReviewRow, 'id' | 'rating' | 'comment' | 'created_at'> & {
    reviewer?: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null
    booking?: {
        experience?: Pick<ExperienceRow, 'title'> | null
    } | null
}

export interface BookingGuestDetails {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    country: string
    zipCode: string
}

export type CreateBookingResult =
    | { success: true; bookingId: string; isNewUser?: boolean }
    | { error: string; success?: never; bookingId?: never }

