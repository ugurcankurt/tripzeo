'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

import { Tables } from "@/types/supabase"

export async function getGuestReviews(guestId: string, bookingId?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('reviews')
        .select(`
            *,
            reviewer:profiles!reviewer_id(full_name, avatar_url),
            booking:bookings(
                experience:experiences(title)
            )
        `)
        .eq('reviewee_id', guestId)
        .order('created_at', { ascending: false })

    // If bookingId provided, maybe we want to check if THIS booking has a review specifically?
    // But currently the dialog shows ALL reviews for the guest.

    const { data: reviews, error } = await query

    if (error) {
        console.error("Error fetching guest reviews:", error)
        return { reviews: [] }
    }

    return { reviews }
}

export async function createReview(prevState: unknown, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to leave a review." }
    }

    const bookingId = formData.get("bookingId") as string
    const rating = parseInt(formData.get("rating") as string)
    const comment = formData.get("comment") as string
    const reviewType = formData.get("reviewType") as string // 'host_review' or 'user_review'

    if (!bookingId || !rating || !comment || !reviewType) {
        return { error: "All fields are required." }
    }

    // Verify Booking and Participation
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        return { error: "Booking not found." }
    }

    // Determine Reviewee
    let revieweeId = ''

    if (reviewType === 'user_review') {
        // Host reviewing Guest
        if (booking.host_id !== user.id) return { error: "Unauthorized: You are not the host of this booking." }
        revieweeId = booking.user_id
    } else if (reviewType === 'host_review') {
        // Guest reviewing Host (Experience)
        if (booking.user_id !== user.id) return { error: "Unauthorized: You are not the guest of this booking." }
        revieweeId = booking.host_id // Or experience_id if structure was different, but schema says reviewee_id is profile
    } else {
        return { error: "Invalid review type." }
    }

    // Check if already reviewed (Optional constraint, good to have)
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('reviewer_id', user.id)
        .single()

    if (existingReview) {
        return { error: "You have already reviewed this booking." }
    }

    const { error: insertError } = await supabase
        .from('reviews')
        .insert({
            booking_id: bookingId,
            reviewer_id: user.id,
            reviewee_id: revieweeId,
            rating: rating,
            comment: comment,
            type: reviewType as Tables<'reviews'>['type'],
            created_at: new Date().toISOString()
        })

    if (insertError) {
        console.error("Create review error:", insertError)
        return { error: "Failed to submit review. Please try again." }
    }

    // Revalidate paths
    revalidatePath(`/requests`) // Vendor dashboard
    revalidatePath(`/account/orders`) // User dashboard
    revalidatePath(`/vendor/bookings`)

    return { success: true }
}

export async function deleteReview(reviewId: string) {
    const supabase = await createClient()

    // 1. Check Auth & Admin Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: "Unauthorized" }

    // 2. Delete Review
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

    if (error) {
        console.error("Delete review error:", error)
        return { error: "Failed to delete review" }
    }

    revalidatePath('/admin/reviews')
    return { success: "Review deleted successfully" }
}
