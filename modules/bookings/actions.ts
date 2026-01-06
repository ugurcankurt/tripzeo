'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export async function createBooking(prevState: unknown, formData: FormData) {
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to book an experience." }
    }

    const experienceId = formData.get("experienceId") as string
    const dateString = formData.get("date") as string
    const guests = parseInt(formData.get("guests") as string)

    if (!experienceId || !dateString || !guests) {
        return { error: "Missing required booking information." }
    }

    try {
        // 2. Fetch Experience Data
        const { data: experience, error: expError } = await supabase
            .from('experiences')
            .select('price, host_id, is_active, duration_minutes, start_time, end_time')
            .eq('id', experienceId)
            .single()

        if (expError || !experience) {
            return { error: "Experience not found." }
        }

        if (experience.host_id === user.id) {
            return { error: "You cannot book your own experience." }
        }

        if (!experience.is_active) {
            return { error: "This experience is currently not available." }
        }

        // 3. Fetch Platform Settings (Defaults if missing)
        const { data: settings } = await supabase
            .from('platform_settings')
            .select('key, value')
            .in('key', ['SERVICE_FEE_RATE', 'COMMISSION_RATE'])

        const serviceFeeRate = Number(settings?.find(s => s.key === 'SERVICE_FEE_RATE')?.value) || 0
        const commissionRate = Number(settings?.find(s => s.key === 'COMMISSION_RATE')?.value) || 0

        // 4. Calculate Financials
        const subtotal = Number(experience.price) * guests
        const serviceFee = subtotal * serviceFeeRate
        const totalAmount = subtotal + serviceFee
        const commissionAmount = subtotal * commissionRate
        const hostEarnings = subtotal - commissionAmount

        // 4.1 Update User Profile with Address Info if provided
        const address = formData.get("address") as string
        const city = formData.get("city") as string
        const country = formData.get("country") as string
        const zipCode = formData.get("zipCode") as string

        if (address && city && country) {
            const { error: profileUpdateError } = await supabase.from('profiles').update({
                address,
                city,
                country,
                zip_code: zipCode
            }).eq('id', user.id)

            if (profileUpdateError) {
                console.error("Failed to update profile with booking address:", profileUpdateError)
                // We don't block booking creation but we should know
            }
        }

        // 5. Insert Booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                user_id: user.id,
                experience_id: experienceId,
                host_id: experience.host_id,
                booking_date: new Date(dateString).toISOString(),
                attendees_count: guests,
                total_amount: totalAmount,
                host_earnings: hostEarnings,
                service_fee: serviceFee,
                commission_amount: commissionAmount,
                status: 'pending_payment',
                duration_minutes: experience.duration_minutes,
                start_time: experience.start_time,
                end_time: experience.end_time
            })
            .select('id')
            .single()

        if (bookingError) {
            console.error("Booking Error:", bookingError)
            return { error: "Failed to create booking. Please try again." }
        }

        // Return booking ID for client-side redirection
        return { success: true, bookingId: booking.id }

    } catch (error) {
        console.error("Create Booking Exception:", error)
        return { error: "An unexpected error occurred." }
    }
}

import iyzipay from "@/lib/iyzipay"

import { User } from "@supabase/supabase-js"
import { Tables } from "@/types/supabase"

// Helper to check permissions
async function checkBookingPermission(booking: Tables<'bookings'>, user: User) {
    if (booking.host_id === user.id || booking.user_id === user.id) return { authorized: true, role: 'owner_or_host' }

    // Check if admin
    const supabase = await createClient()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') return { authorized: true, role: 'admin' }

    return { authorized: false, role: null }
}

export async function approveBooking(bookingId: string) {
    const supabase = await createClient()

    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // 2. Fetch Booking
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*, experience:experiences(currency)')
        .eq('id', bookingId)
        .single()

    if (fetchError || !booking) return { error: "Booking not found" }

    // PERMISSION CHECK: Host or Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isHost = booking.host_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isHost && !isAdmin) return { error: "Unauthorized" }

    // 3. Capture Payment (Post-Auth)
    if (booking.payment_transaction_id) {
        try {
            const request = {
                locale: 'en',
                conversationId: bookingId,
                paymentId: booking.payment_id, // Required for PostAuth
                price: booking.total_amount.toString(),
                currency: booking.experience?.currency || 'TRY',
                ip: '85.34.78.112',
            }

            // Call Iyzipay Post-Auth (Capture)
            const result = await new Promise<any>((resolve, reject) => {
                iyzipay.paymentPostAuth.create(request, (err: any, result: any) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })

            if (result.status !== 'success') {
                console.error("Iyzipay Capture Error:", result.errorMessage)
                return { error: `Payment capture failed: ${result.errorMessage}` }
            }

        } catch (error) {
            console.error("Iyzipay Capture Exception:", error)
            return { error: "Payment capture failed." }
        }
    } else {
        // If no payment ID (maybe manual booking?), pass through
        console.warn("No payment transaction ID found for booking", bookingId)
    }

    // 4. Update Booking Status (Use Service Role to bypass Host RLS restrictions)
    const adminSupabase = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await adminSupabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId)

    if (updateError) return { error: "Database update failed" }

    revalidatePath('/admin/bookings')
    revalidatePath('/vendor/bookings')
    return { success: "Booking approved and payment captured" }
}

export async function rejectBooking(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).single()
    if (!booking) return { error: "Booking not found" }

    // PERMISSION CHECK: Host or Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (booking.host_id !== user.id && profile?.role !== 'admin') return { error: "Unauthorized" }

    // Iyzipay Cancel (Void Pre-Auth)
    if (booking.payment_id) {
        try {
            const request = {
                locale: 'en',
                conversationId: bookingId,
                paymentId: booking.payment_id,
                ip: '85.34.78.112',
            }
            const result = await new Promise<any>((resolve, reject) => {
                iyzipay.cancel.create(request, (err: any, result: any) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })

            if (result.status !== 'success') {
                console.error("Iyzipay Cancel Error:", result.errorMessage)
                return { error: "Cancellation failed: " + result.errorMessage }
            }
        } catch (error) {
            console.error("Iyzipay Cancel Exception:", error)
            return { error: "Cancellation failed." }
        }
    }

    const adminSupabase = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('bookings').update({ status: 'cancelled_by_host' }).eq('id', bookingId)
    revalidatePath('/admin/bookings')
    revalidatePath('/vendor/bookings')
    return { success: "Booking rejected successfully" }
}

export async function refundBooking(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: booking } = await supabase
        .from('bookings')
        .select('*, experience:experiences(currency)')
        .eq('id', bookingId)
        .single()
    if (!booking) return { error: "Booking not found" }

    // PERMISSION CHECK: Host or Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (booking.host_id !== user.id && profile?.role !== 'admin') return { error: "Unauthorized" }

    // Iyzipay Refund (Refund Captured Amount)
    if (booking.payment_transaction_id) {
        try {
            const request = {
                locale: 'en',
                conversationId: bookingId,
                paymentTransactionId: booking.payment_transaction_id,
                price: booking.total_amount.toString(),
                ip: '85.34.78.112',
                currency: booking.experience?.currency || 'USD'
            }
            const result = await new Promise<any>((resolve, reject) => {
                iyzipay.refund.create(request, (err: any, result: any) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })

            if (result.status !== 'success') {
                console.error("Iyzipay Refund Error:", result.errorMessage)
                return { error: "Refund failed: " + result.errorMessage }
            }
        } catch (error) {
            console.error("Iyzipay Refund Exception:", error)
            return { error: "Refund failed." }
        }
    }

    const adminSupabase = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('bookings').update({ status: 'cancelled_by_host' }).eq('id', bookingId) // Or 'refunded' if that status exists
    revalidatePath('/admin/bookings')
    revalidatePath('/vendor/bookings')
    return { success: "Booking refunded successfully" }
}

export async function completeBooking(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).single()
    if (!booking) return { error: "Booking not found" }

    // PERMISSION CHECK: Admin only for manual completion usually, or Host if date passed? 
    // Let's allow Admin and Host for now, similar to other actions.
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (booking.host_id !== user.id && profile?.role !== 'admin') return { error: "Unauthorized" }

    const adminSupabase = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)

    if (error) return { error: "Failed to complete booking" }

    revalidatePath('/admin/bookings')
    revalidatePath('/vendor/bookings')
    return { success: "Booking marked as completed" }
}

export async function getPendingBookingsCount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0
    const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending_payment')
    return count || 0
}

export async function cancelBooking(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).single()
    if (!booking) return { error: "Booking not found" }

    // Allow user to cancel their own booking
    if (booking.user_id !== user.id) return { error: "Unauthorized" }

    // Logic: If 'pending_host_approval' -> Iyzipay Cancel (Void)
    // If 'confirmed' -> Iyzipay Refund (Refund)

    if (booking.status === 'pending_host_approval' && booking.payment_id) {
        // Void Pre-Auth
        try {
            const request = {
                locale: 'en',
                conversationId: bookingId,
                paymentId: booking.payment_id,
                ip: '85.34.78.112',
            }
            const result = await new Promise<any>((resolve, reject) => {
                iyzipay.cancel.create(request, (err: any, result: any) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
            if (result.status !== 'success') console.error("Cancel Error", result.errorMessage)
        } catch (e) {
            console.error("Cancel Exception", e)
        }
    } else if (booking.status === 'confirmed' && booking.payment_transaction_id) {
        // Refund
        try {
            const request = {
                locale: 'en',
                conversationId: bookingId,
                paymentTransactionId: booking.payment_transaction_id,
                price: booking.total_amount.toString(),
                ip: '85.34.78.112',
            }
            const result = await new Promise<any>((resolve, reject) => {
                iyzipay.refund.create(request, (err: any, result: any) => {
                    if (err) reject(err)
                    else resolve(result)
                })
            })
            if (result.status !== 'success') console.error("Refund Error", result.errorMessage)
        } catch (e) {
            console.error("Refund Exception", e)
        }
    }

    const adminSupabase = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('bookings').update({ status: 'cancelled_by_user' }).eq('id', bookingId)
    revalidatePath('/account/orders')
    return { success: "Booking canceled successfully" }
}
