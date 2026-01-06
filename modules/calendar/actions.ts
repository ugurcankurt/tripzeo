"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireHost } from "@/lib/auth/guards"

import { CalendarBooking, CalendarBlockedDate } from "./types"

export async function getCalendarData(monthStart: Date, monthEnd: Date, experienceId?: string) {
    const supabase = await createClient()
    const { user } = await requireHost()

    const startStr = monthStart.toISOString()
    const endStr = monthEnd.toISOString()

    // 1. Fetch Bookings (Confirmed/Completed)
    let bookingsQuery = supabase
        .from('bookings')
        .select(`
            id,
            booking_date,
            status,
            attendees_count,
            experiences (
                id,
                title
            )
        `)
        .eq('host_id', user.id)
        .gte('booking_date', startStr)
        .lte('booking_date', endStr)
        .in('status', ['confirmed', 'completed', 'paid_out'])

    if (experienceId && experienceId !== 'all') {
        bookingsQuery = bookingsQuery.eq('experience_id', experienceId)
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery.returns<CalendarBooking[]>()
    if (bookingsError) throw bookingsError

    // 2. Fetch Blocked Dates
    let availabilityQuery = supabase
        .from('experience_availability')
        .select(`
            id,
            date,
            is_blocked,
            experience_id,
            experiences (
                id,
                title
            )
        `)
        .gte('date', startStr.split('T')[0])
        .lte('date', endStr.split('T')[0])
        .eq('is_blocked', true)

    if (experienceId && experienceId !== 'all') {
        availabilityQuery = availabilityQuery.eq('experience_id', experienceId)
    } else {
        // SECURITY FIX: Explicitly filter by this host's experiences to prevent data leak
        // Fetch all experience IDs for this host first
        const { data: myExperiences } = await supabase
            .from('experiences')
            .select('id')
            .eq('host_id', user.id)

        const myExperienceIds = myExperiences?.map(e => e.id) || []

        // If no experiences, return empty blocked dates
        if (myExperienceIds.length === 0) {
            return {
                bookings,
                blockedDates: []
            }
        }

        availabilityQuery = availabilityQuery.in('experience_id', myExperienceIds)
    }

    const { data: blockedDates, error: availabilityError } = await availabilityQuery.returns<CalendarBlockedDate[]>()
    if (availabilityError) throw availabilityError

    return {
        bookings,
        blockedDates
    }
}

export async function toggleBlockDate(experienceId: string, dateStr: string, shouldBlock: boolean) {
    const supabase = await createClient()
    const { user } = await requireHost()

    // Date is received as YYYY-MM-DD string, so no timezone conversion needed.
    // const dateStr = date.toISOString().split('T')[0] // REMOVED causing timezone issues

    try {
        if (shouldBlock) {
            // INSERT
            const { error } = await supabase
                .from('experience_availability')
                .upsert({
                    experience_id: experienceId,
                    date: dateStr,
                    is_blocked: true
                }, {
                    onConflict: 'experience_id, date'
                })

            if (error) throw error
        } else {
            // DELETE
            const { error } = await supabase
                .from('experience_availability')
                .delete()
                .match({
                    experience_id: experienceId,
                    date: dateStr
                })

            if (error) throw error
        }

        revalidatePath('/vendor/calendar')
        return { success: true }
    } catch (error: unknown) {
        console.error("Error toggling block:", error)
        return { error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
}

export async function getHostExperiences() {
    const supabase = await createClient()
    const { user } = await requireHost()

    const { data, error } = await supabase
        .from('experiences')
        .select('id, title')
        .eq('host_id', user.id)
        .order('title')

    if (error) throw error
    return data
}
