import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import type { ConversationItem } from '@/modules/messaging/actions'
import { getUserConversations } from '@/modules/messaging/actions'

type Message = Database['public']['Tables']['messages']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']

interface ChatState {
    conversations: ConversationItem[]
    // Cache messages by conversation ID
    messages: Record<string, Message[]>
    activeConversationId: string | null
    totalUnreadCount: number
    initialized: boolean

    // Actions
    initialize: (userId: string) => Promise<void>
    setActiveConversation: (id: string | null) => void
    fetchMessages: (conversationId: string) => Promise<void>
    sendMessage: (content: string, bookingId: string, currentUserId: string) => Promise<{ success?: boolean; error?: string }>
    markAsRead: (conversationId: string, currentUserId: string) => Promise<void>

    // Internal Helper for Realtime
    handleMessageInsert: (message: Message) => void
    handleMessageUpdate: (message: Message) => void
    handleConversationUpdate: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    messages: {},
    activeConversationId: null,
    totalUnreadCount: 0,
    initialized: false,

    initialize: async (userId: string) => {
        if (get().initialized) return

        const supabase = createClient()

        // 1. Initial Fetch of Conversations
        // We still use the server action logic but call it via store, 
        // OR we can fetch client-side for consistency with previous fix.
        // Let's use the robust client-side fetch from the widget refactor to ensure consistency.

        const fetchConvs = async () => {
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
                .order('updated_at', { ascending: false })

            if (data) {
                const formatted: ConversationItem[] = data.map((conv: any) => {
                    const isAmHost = conv.booking.host_id === userId
                    const otherProfile = isAmHost ? conv.booking.guest : conv.booking.host

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

                // Calculate unread count

                // Calculate unread count (Total unread messages)
                const unreadCount = data.reduce((total: number, conv: any) => {
                    const threadUnread = (conv.messages || []).filter((m: any) => !m.is_read && m.sender_id !== userId).length
                    return total + threadUnread
                }, 0)

                set({ conversations: formatted, totalUnreadCount: unreadCount, initialized: true })
            }
        }

        await fetchConvs()

        // 2. Robust Realtime Subscription
        // We listen for messages where we are the receiver (incoming) or sender (outgoing confirmation/sync)
        supabase
            .channel('user-chat-store')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`
                },
                (payload) => get().handleMessageInsert(payload.new as Message)
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${userId}`
                },
                (payload) => get().handleMessageInsert(payload.new as Message)
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`
                },
                (payload) => get().handleMessageUpdate(payload.new as Message)
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${userId}`
                },
                (payload) => get().handleMessageUpdate(payload.new as Message)
            )
            .subscribe()
    },

    setActiveConversation: (id) => {
        set({ activeConversationId: id })
        // If opening, fetch messages if not cached? 
        // We'll leave that to the UI component to trigger `fetchMessages` or handle it here.
    },

    fetchMessages: async (conversationId: string) => {
        // If we already have messages, maybe we don't need to refetch? 
        // But for fresh open, it's good to sync.
        const supabase = createClient()
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (data) {
            set(state => ({
                messages: {
                    ...state.messages,
                    [conversationId]: data
                }
            }))
        }
    },

    sendMessage: async (content, bookingId, currentUserId) => {
        const { sendMessage: sendAction } = await import('@/modules/messaging/actions')

        // Optimistic update could happen here but simpler to wait for Realtime to rebound
        // Actually, for "snappy" feel, we might want to optimistic append to `messages` if active.

        const result = await sendAction({ content, bookingId })
        return result
    },

    markAsRead: async (conversationId, currentUserId) => {
        // Optimistic Update: Mark all messages in this convo from OTHER user as read
        const state = get()
        const msgs = state.messages[conversationId] || []
        const unreadIds = msgs
            .filter(m => !m.is_read && m.sender_id !== currentUserId)
            .map(m => m.id)

        if (unreadIds.length === 0) return

        // Update Local State
        const updatedMsgs = msgs.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m)
        set(s => ({
            messages: { ...s.messages, [conversationId]: updatedMsgs }
            // Conversation list unread update happens via handleMessageUpdate/re-render or derived state
        }))

        // DB Update
        const supabase = createClient()
        await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds)
    },

    // --- Realtime Handlers ---

    handleMessageInsert: (message) => {
        const state = get()

        // 1. Update Messages Cache if we have this conversation loaded
        if (state.messages[message.conversation_id]) {
            set(s => ({
                messages: {
                    ...s.messages,
                    [message.conversation_id]: [...s.messages[message.conversation_id], message]
                }
            }))
        }

        // 2. Update Conversation List (Last Message & Order)
        // Ideally we refetch the list to be ensuring correctness, especially for sorting.
        // Or we manual patch. Refetching is safer as per previous lesson.
        // Let's call the same internal logic used in initialize, but we need to extract it.
        // For now, simpler to just trigger a re-fetch of conversations.
        get().handleConversationUpdate()
    },

    handleMessageUpdate: (message) => {
        const state = get()
        // Update specific message in cache
        if (state.messages[message.conversation_id]) {
            const updated = state.messages[message.conversation_id].map(m =>
                m.id === message.id ? message : m
            )
            set(s => ({
                messages: { ...s.messages, [message.conversation_id]: updated }
            }))
        }
        // Also refresh list to update read status indicators
        get().handleConversationUpdate()
    },

    handleConversationUpdate: async () => {
        // Re-run the fetch logic. 
        // Since we can't easily reuse the logic inside `initialize` without defining it outside, 
        // we'll just replicate the fetch call or make `initialize` robust enough to be called to "refresh".
        // Actually, let's just copy the fetch logic here for clarity or create a private helper.
        // For brevity in this file edit, I'll copy the supabase client logic.

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

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
            .order('updated_at', { ascending: false })

        if (data) {
            const formatted: ConversationItem[] = data.map((conv: any) => {
                const isAmHost = conv.booking.host_id === user.id
                const otherProfile = isAmHost ? conv.booking.guest : conv.booking.host
                const sortedMessages = (conv.messages || []).sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                const lastMsg = sortedMessages[0] || null

                return {
                    id: conv.id,
                    booking_id: conv.booking_id,
                    updated_at: conv.updated_at,
                    booking: { status: conv.booking.status },
                    other_user: otherProfile,
                    last_message: lastMsg ? {
                        content: lastMsg.content,
                        created_at: lastMsg.created_at,
                        is_read: lastMsg.is_read,
                        sender_id: lastMsg.sender_id
                    } : null
                }
            })


            const unreadCount = data.reduce((total: number, conv: any) => {
                const threadUnread = (conv.messages || []).filter((m: any) => !m.is_read && m.sender_id !== user.id).length
                return total + threadUnread
            }, 0)

            set({ conversations: formatted, totalUnreadCount: unreadCount })
        }
    }
}))
