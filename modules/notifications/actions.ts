'use server'

import { createClient } from "@/lib/supabase/server"
import { createNotificationSchema, type CreateNotificationInput } from "./schema"

export async function createNotification(input: CreateNotificationInput) {
    const result = createNotificationSchema.safeParse(input)

    if (!result.success) {
        console.error("Notification validation failed:", result.error)
        return { error: "Invalid notification data" }
    }

    const { userId, title, message, link } = result.data

    // Use Admin Client (Service Role) to bypass RLS
    // This allows sending notifications to ANY user regardless of who is logged in.
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )


    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            link,
            is_read: false
        })

    if (error) {
        console.error("Failed to create notification:", error)
        return { error: "Failed to create notification" }
    }

    // --- SEND EMAIL (Fire and Forget) ---
    // We don't await this to avoid blocking the UI
    (async () => {
        try {
            // 1. Fetch user email & name
            const { data: profile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', userId)
                .single()

            if (profile?.email && !result.data.skipEmail) {
                const { sendNotificationEmail } = await import('@/lib/email')
                await sendNotificationEmail(profile.email, {
                    title,
                    message,
                    link,
                    userName: profile.full_name
                })
            }
        } catch (err) {
            console.error("Failed to trigger email notification:", err)
        }
    })()

    return { success: true }
}

export async function markNotificationAsRead(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

    if (error) {
        console.error("Failed to mark notification as read:", error)
        return { error: "Failed to update notification" }
    }

    return { success: true }
}

export async function deleteNotification(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Ensure ownership

    if (error) {
        console.error("Failed to delete notification:", error)
        return { error: "Failed to delete notification" }
    }

    return { success: true }
}
