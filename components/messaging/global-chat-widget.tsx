'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Search, MessageSquare, X, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ChatWindow } from "@/components/messaging/chat-window"
import { useChatStore } from "@/stores/chat-store"

interface GlobalChatWidgetProps {
    currentUserId: string
}

export function GlobalChatWidget({ currentUserId }: GlobalChatWidgetProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // State
    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState<'list' | 'chat'>('list')
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Global Store
    const {
        conversations,
        totalUnreadCount,
        initialize,
        setActiveConversation
    } = useChatStore()

    // 1. Initialize Store on Mount
    useEffect(() => {
        if (currentUserId) {
            initialize(currentUserId)
        }
    }, [currentUserId, initialize])

    // 2. Handle Deep Linking
    useEffect(() => {
        const chatParam = searchParams.get('chat')
        if (chatParam) {
            setIsOpen(true)
            setSelectedBookingId(chatParam)
            setView('chat')
            setActiveConversation(chatParam)
        }
    }, [searchParams, setActiveConversation])

    // 3. Handle Conversation Selection
    const handleSelectConversation = (bookingId: string) => {
        setSelectedBookingId(bookingId)
        setActiveConversation(bookingId)
        setView('chat')
        router.push(`${pathname}?chat=${bookingId}`, { scroll: false })
    }

    const handleBackToList = () => {
        setView('list')
        setSelectedBookingId(null)
        setActiveConversation(null)
        const params = new URLSearchParams(searchParams.toString())
        params.delete('chat')
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const handleClose = () => {
        setIsOpen(false)
        setActiveConversation(null)
        const params = new URLSearchParams(searchParams.toString())
        params.delete('chat')
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // Filter conversations
    const filteredConversations = conversations.filter(c =>
        c.other_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_message?.content.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Unread count comes from store now
    const unreadCount = totalUnreadCount

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Main Widget Container */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[400px] h-[600px] max-h-[80vh] max-w-[90vw] bg-background border shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 origin-bottom-right">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
                        {view === 'chat' ? (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 rounded-full" onClick={handleBackToList}>
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 border bg-muted">
                                        <AvatarImage
                                            src={conversations.find(c => c.booking_id === selectedBookingId)?.other_user?.avatar_url || conversations.find(c => c.booking_id === selectedBookingId)?.other_user?.category?.icon || ''}
                                            className={cn(
                                                conversations.find(c => c.booking_id === selectedBookingId)?.other_user?.avatar_url ? "object-cover" : "object-contain p-1 opacity-70"
                                            )}
                                        />
                                        <AvatarFallback>{conversations.find(c => c.booking_id === selectedBookingId)?.other_user?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-sm">
                                        {conversations.find(c => c.booking_id === selectedBookingId)?.other_user?.full_name || 'Chat'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <h3 className="font-semibold text-lg">Messages</h3>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative bg-gray-50/50">
                        {/* List View */}
                        <div className={cn(
                            "absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out",
                            view === 'list' ? "translate-x-0" : "-translate-x-full"
                        )}>
                            <div className="p-3 border-b bg-background">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input
                                        placeholder="Search conversations..."
                                        className="pl-9 h-9 bg-gray-100 border-none rounded-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                {filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 gap-2">
                                        <MessageSquare className="h-8 w-8 opacity-20" />
                                        <p className="text-sm">No messages yet</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col p-2 gap-1">
                                        {filteredConversations.map((conv) => (
                                            <button
                                                key={conv.id}
                                                onClick={() => handleSelectConversation(conv.booking_id)}
                                                className="flex items-center gap-3 p-3 text-left bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl transition-all shadow-sm group"
                                            >
                                                <Avatar className="h-10 w-10 border border-gray-100 bg-muted">
                                                    <AvatarImage
                                                        src={conv.other_user?.avatar_url || conv.other_user?.category?.icon || ''}
                                                        className={cn(
                                                            conv.other_user?.avatar_url ? "object-cover" : "object-contain p-1.5 opacity-70"
                                                        )}
                                                    />
                                                    <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                                                        {conv.other_user?.full_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="font-semibold text-sm truncate text-gray-900 group-hover:text-primary transition-colors">
                                                            {conv.other_user?.full_name || "Unknown"}
                                                        </span>
                                                        {conv.last_message && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={cn(
                                                        "text-xs truncate pr-2 leading-relaxed",
                                                        conv.last_message?.is_read === false && conv.last_message.sender_id !== currentUserId
                                                            ? "font-semibold text-gray-900"
                                                            : "text-muted-foreground"
                                                    )}>
                                                        {conv.last_message?.content || "No messages yet"}
                                                    </p>
                                                </div>
                                                {conv.last_message?.is_read === false && conv.last_message.sender_id !== currentUserId && (
                                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Chat View */}
                        <div className={cn(
                            "absolute inset-0 bg-background flex flex-col transition-transform duration-300 ease-in-out",
                            view === 'chat' ? "translate-x-0" : "translate-x-full"
                        )}>
                            {selectedBookingId && (
                                <ChatWindow
                                    bookingId={selectedBookingId}
                                    currentUserId={currentUserId}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Launcher Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105",
                    isOpen ? "rotate-90 bg-gray-200 text-gray-600 hover:bg-gray-300" : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}

                {/* Unread Badge on Launcher */}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>
        </div>
    )
}
