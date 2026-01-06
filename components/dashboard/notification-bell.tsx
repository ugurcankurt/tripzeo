'use client'

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
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
        markAllAsRead
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
                                <button
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors",
                                        !notification.is_read && "bg-muted/20"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <span className={cn(
                                            "font-medium text-sm flex-1",
                                            !notification.is_read && "text-foreground"
                                        )}>
                                            {notification.title}
                                        </span>
                                        {!notification.is_read && (
                                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
