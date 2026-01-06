import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Notification = Database['public']['Tables']['notifications']['Row']

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    initialized: boolean

    // Actions
    initialize: (userId: string) => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    addNotification: (notification: Notification) => void
    removeNotification: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    initialized: false,

    initialize: async (userId: string) => {
        if (get().initialized) return

        const supabase = createClient()

        // 1. Fetch initial notifications
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20) // Limit to last 20 for UI

        const notifications = data || []
        const unreadCount = notifications.filter(n => !n.is_read).length

        set({ notifications, unreadCount, initialized: true })

        // 2. Subscribe to realtime improvements
        supabase
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
                    get().addNotification(payload.new as Notification)
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
                    // Handle read status updates or content updates
                    const updated = payload.new as Notification
                    set(state => ({
                        notifications: state.notifications.map(n => n.id === updated.id ? updated : n),
                        // Re-calc unread count
                        unreadCount: state.notifications.map(n => n.id === updated.id ? updated : n).filter(n => !n.is_read).length
                    }))
                }
            )
            .subscribe()
    },

    addNotification: (notification: Notification) => {
        set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }))
    },

    markAsRead: async (id: string) => {
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
            // Revert on error? Optionally.
        }
    },

    markAllAsRead: async () => {
        const supabase = createClient()
        const currentUnread = get().notifications.filter(n => !n.is_read)

        if (currentUnread.length === 0) return

        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, is_read: true })),
            unreadCount: 0
        }))

        const ids = currentUnread.map(n => n.id)
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', ids)
    },

    removeNotification: async (id: string) => {
        // Optimistic update
        const state = get()
        const notification = state.notifications.find(n => n.id === id)
        const wasUnread = notification && !notification.is_read

        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        }))

        // Call Server Action
        const { deleteNotification } = await import('@/modules/notifications/actions')
        const result = await deleteNotification(id)

        if (result.error) {
            console.error("Error removing notification in store:", result.error)
            // Revert? (Optional: fetch again or add back)
        }
    }
}))
