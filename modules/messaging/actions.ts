'use server'

import { createClient } from "@/lib/supabase/server"
import { messageSchema } from "./schema"
import { revalidatePath } from "next/cache"
import { z } from "zod"


/**
 * Sends a message in the context of a Booking.
 * Automatically finds or creates the conversation.
 */
export async function sendMessage(data: z.infer<typeof messageSchema>) {
    const supabase = await createClient()

    // 1. Validate Input (server-side, including regex)
    const validation = messageSchema.safeParse(data)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }

    const { content, bookingId } = validation.data

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Unauthorized" }
    }

    // 3. Verify Booking & Permissions
    // We need to know if the user is authorized (User or Host of this booking)
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, user_id, host_id, status')
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        return { error: "Booking not found" }
    }

    if (booking.user_id !== user.id && booking.host_id !== user.id) {
        return { error: "Unauthorized access to this booking" }
    }

    // Check removed to allow messaging for all booking statuses as per user request
    // if (booking.status !== 'confirmed') {
    //    return { error: `Messaging is not allowed for ${booking.status?.replace('_', ' ')} bookings. Wait for confirmation.` }
    // }

    // 4. Find or Create Conversation
    // Try to find existing conversation
    let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('booking_id', bookingId)
        .single()

    // If not exists, create it
    if (!conversation) {
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ booking_id: bookingId })
            .select('id')
            .single()

        if (createError) {
            console.error("Failed to create conversation:", createError)
            return { error: "Failed to initiate conversation" }
        }
        conversation = newConv
    }

    if (!conversation) {
        return { error: "System error: Could not retrieve conversation" }
    }

    // Determine recipient
    const recipientId = user.id === booking.user_id ? booking.host_id : booking.user_id

    // 5. Insert Message
    const { error: messageError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            receiver_id: recipientId,
            content: content
        })

    if (messageError) {
        console.error("Failed to send message:", messageError)
        return { error: "Failed to send message" }
    }

    // 5b. Touch Conversation (Update updated_at) to trigger realtime listeners on conversation list
    await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id)

    // 6. Notify Recipient
    // Notification logic removed as per request (Chat widget handles its own notifications)


    return { success: true }
}

export async function getConversation(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const { data, error } = await supabase
        .from('conversations')
        .select(`
            id,
            messages (
                id,
                content,
                sender_id,
                created_at,
                is_read
            )
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { referencedTable: 'messages', ascending: true })
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        return { error: error.message }
    }

    // Transform / Return
    return { conversation: data }
}

export type ConversationItem = {
    id: string
    booking_id: string
    updated_at: string
    booking: {
        status: string | null
    }
    other_user: {
        full_name: string | null
        avatar_url: string | null
    } | null
    last_message: {
        content: string
        created_at: string
        is_read: boolean
        sender_id: string
    } | null
}

export async function getUserConversations() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch conversations where user is participant via Booking
    // We need to fetch enough info to display the list:
    // - Other user's name/avatar (Host if I am Guest, Guest if I am Host)
    // - Booking status
    // - Last message

    const { data } = await supabase
        .from('conversations')
        .select(`
            id,
            booking_id,
            updated_at,
            booking:bookings!inner (
                user_id,
                host_id,
                status,
                guest:profiles!bookings_user_id_fkey(id, full_name, avatar_url),
                host:profiles!bookings_host_id_fkey(id, full_name, avatar_url)
            ),
            messages (
                content,
                created_at,
                is_read,
                sender_id
            )
        `)
        .or(`host_id.eq.${user.id},user_id.eq.${user.id}`, { foreignTable: 'booking' })
        .order('updated_at', { ascending: false })

    if (!data) return []

    // Transform to friendly format
    const conversations: ConversationItem[] = data.map((conv: any) => {
        // Determine "Other User"
        const isAmHost = conv.booking.host_id === user.id
        const otherProfile = isAmHost ? conv.booking.guest : conv.booking.host

        // Determine Last Message (Supabase returns array, we want latest)
        // Since we ordered conversations by updated_at, usually that matches, 
        // but let's sort messages just in case or pick the last one inserted.
        // Actually the query above fetches ALL messages for list, which is heavy. 
        // Optimized approach: limit messages or uses a distinct query. 
        // For MVP with small chat history, sorting locally is "ok" but ideally we change the query.
        // Let's just take the last element of the array if sorted by time.
        // Note: The select above didn't sort messages.

        const sortedMessages = (conv.messages || []).sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        const lastMsg = sortedMessages[0] || null

        return {
            id: conv.id,
            booking_id: conv.booking_id,
            updated_at: conv.updated_at,
            booking: {
                status: conv.booking.status
            },
            other_user: otherProfile,
            last_message: lastMsg ? {
                content: lastMsg.content,
                created_at: lastMsg.created_at,
                is_read: lastMsg.is_read,
                sender_id: lastMsg.sender_id
            } : null
        }
    })

    return conversations
}
