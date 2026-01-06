'use client'

import { useEffect, useState } from "react"
import { Bell, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationStore } from "@/stores/notification-store"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function NotificationBell() {
    const {
        notifications,
        unreadCount,
        initialize,
        markAsRead,
        markAllAsRead,
        removeNotification
    } = useNotificationStore()

    const [userId, setUserId] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    // Init store on mount
    useEffect(() => {
        async function init() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                initialize(user.id)
            }
        }
        init()
    }, [initialize])

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification.id)
        if (notification.link) {
            setOpen(false)
            router.push(notification.link)
        }
    }

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        removeNotification(id)
    }

    if (!userId) return null

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-1 text-muted-foreground"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground text-sm">
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="group relative w-full hover:bg-muted/50 transition-colors">
                                    <button
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-4 text-left w-full",
                                            !notification.is_read && "bg-muted/20"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-center gap-2 w-full pr-6">
                                            <span className={cn(
                                                "font-medium text-sm flex-1",
                                                !notification.is_read && "text-foreground"
                                            )}>
                                                {notification.title}
                                            </span>
                                            {!notification.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 hover:bg-transparent"
                                        onClick={(e) => handleDelete(e, notification.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
