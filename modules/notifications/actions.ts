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
    const supabase = await createClient()

    // Since this is often called from other server actions (system events), 
    // we bypass RLS by using service role logic IF NEEDED, 
    // but typically standard client is fine if the TRIGGERING user has permission 
    // to insert (which we handled via 'authenticated' insert policy).
    // However, sending a notification to ANYONE usually implies system privilege.
    // Our RLS allows 'authenticated' to INSERT. That works for now.

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
