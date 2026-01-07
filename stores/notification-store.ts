import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

type Notification = Database['public']['Tables']['notifications']['Row']

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    initialized: boolean
    initializing: boolean // Guard for double-invocation
    currentUserId: string | null
    subscription: RealtimeChannel | null

    // Actions
    initialize: (userId: string) => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    addNotification: (notification: Notification) => void
    removeNotification: (id: string) => Promise<void>
    reset: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    initialized: false,
    currentUserId: null,
    subscription: null,

    initializing: false,

    initialize: async (userId: string) => {
        const { currentUserId, initialized, subscription, initializing } = get()

        // Guard: Prevent double-execution (React Strict Mode or rapid calls)
        if (initializing) return
        if (initialized && currentUserId === userId) return

        set({ initializing: true })

        try {
            // Clean up existing subscription if any
            if (subscription) {
                await subscription.unsubscribe()
            }

            const supabase = createClient()

            // CRITICAL: Ensure session is hydrated before fetching/subscribing
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                console.error("No active session found. Cannot initialize notifications.")
                set({ initializing: false })
                return
            }

            // 1. Fetch initial notifications
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)

            const notifications = data || []
            const unreadCount = notifications.filter(n => !n.is_read).length

            // 2. Subscribe to realtime changes
            // STRATEGY: Exact alignment with chat-store.ts
            // - Channel: 'user-notifications' (Shared/Static)
            // - Filter: Explicit 'user_id=eq.{id}'
            // - Guard: Strict Session Check (Already done above)
            const newSubscription = supabase
                .channel('user-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${userId}`
                    },
                    (payload) => {
                        const newNotification = payload.new as Notification
                        if (newNotification.user_id === userId) {
                            get().addNotification(newNotification)
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${userId}`
                    },
                    (payload) => {
                        const updated = payload.new as Notification
                        if (updated.user_id === userId) {
                            set(state => ({
                                notifications: state.notifications.map(n => n.id === updated.id ? updated : n),
                                unreadCount: state.notifications.map(n => n.id === updated.id ? updated : n).filter(n => !n.is_read).length
                            }))
                        }
                    }
                )
                .subscribe((status, err) => {
                    if (status === 'SUBSCRIBED') {
                        console.log(`Realtime connected for user: ${userId} on channel: user-notifications`)
                    }
                    if (status === 'CHANNEL_ERROR') {
                        console.error(`Realtime connection failed for user: ${userId}. Error:`, err)
                    }
                })

            set({
                notifications,
                unreadCount,
                initialized: true,
                currentUserId: userId,
                subscription: newSubscription,
                initializing: false
            })
        } catch (error) {
            console.error("Error initializing notifications:", error)
            set({ initializing: false })
        }
    },

    addNotification: (notification: Notification) => {
        set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }))
    },

    markAsRead: async (id: string) => {
        try {
            // Optimistic update
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }))

            // Call Server Action
            const { markNotificationAsRead } = await import('@/modules/notifications/actions')
            const result = await markNotificationAsRead(id)

            if (result.error) {
                console.error("Error marking as read in store:", result.error)
            }
        } catch (error) {
            console.error("Failed to mark as read (Network/Server error):", error)
        }
    },

    markAllAsRead: async () => {
        try {
            const supabase = createClient()
            const currentUnread = get().notifications.filter(n => !n.is_read)

            if (currentUnread.length === 0) return

            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0
            }))

            const ids = currentUnread.map(n => n.id)
            if (ids.length > 0) {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .in('id', ids)
            }
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    },

    removeNotification: async (id: string) => {
        try {
            const state = get()
            const notification = state.notifications.find(n => n.id === id)
            const wasUnread = notification && !notification.is_read

            set(state => ({
                notifications: state.notifications.filter(n => n.id !== id),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            }))

            const { deleteNotification } = await import('@/modules/notifications/actions')
            const result = await deleteNotification(id)

            if (result.error) {
                console.error("Error removing notification in store:", result.error)
            }
        } catch (error) {
            console.error("Failed to remove notification:", error)
        }
    },

    reset: () => {
        const { subscription } = get()
        if (subscription) subscription.unsubscribe()

        set({
            notifications: [],
            unreadCount: 0,
            initialized: false,
            currentUserId: null,
            subscription: null
        })
    }
}))
