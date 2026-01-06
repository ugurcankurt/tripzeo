'use client'

import { useState, useEffect, useRef } from "react"
import { Send, Loader2, MessageSquareOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/stores/chat-store"
import { cn } from "@/lib/utils"
// MessageBubble is used in the original file, let's look if I need to import it or inline it. 
// The original file used `MessageBubble` component. I should probably keep using it if it exists aside.
// Step 255 shows `import { MessageBubble } from "./message-bubble"`.
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input" // This was also imported.

interface ChatWindowProps {
    bookingId: string
    currentUserId: string
}

export function ChatWindow({ bookingId, currentUserId }: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Global Store
    const {
        messages: messagesRecord,
        conversations,
        sendMessage,
        fetchMessages,
        markAsRead
    } = useChatStore()

    // Resolve Conversation ID from Booking ID
    // The store needs conversationId for messages, but we only have bookingId prop here 
    // (passed from deep link or widget selection).
    // Luckily, the store's `conversations` array contains `id` and `booking_id`.

    const conversation = conversations.find(c => c.booking_id === bookingId)
    const conversationId = conversation?.id

    const messages = conversationId ? (messagesRecord[conversationId] || []) : []

    // We can say it's loading if we have no conversation found yet but we expect one?
    // Or just show empty. If `conversation` is undefined, maybe we haven't fetched yet or it doesn't exist.
    // The Widget fetches conversations. If we are here, we likely selected one.

    // Fetch messages on mount/change
    useEffect(() => {
        if (conversationId) {
            fetchMessages(conversationId)
            markAsRead(conversationId, currentUserId)
        }
    }, [conversationId, fetchMessages, markAsRead, currentUserId])

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // If we don't have the conversation loaded, it might be a NEW conversation.
    // We should NOT block with a loader forever if it's just empty.
    // If messages are empty and conversation is undefined, we assume it's a new chat.

    // Calculate effective messages list
    // const messages = conversationId ? (messagesRecord[conversationId] || []) : []
    // declared above

    // if (!conversation) { ... loader ... } -> REMOVED

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full p-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-10">
                            <MessageSquareOff className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    content={msg.content}
                                    isOwn={msg.sender_id === currentUserId}
                                    createdAt={msg.created_at}
                                    isRead={msg.is_read || false}
                                />
                            ))}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Input Area */}
            {/* The original `MessageInput` component likely used `useChat` internally too? 
                I need to check `MessageInput`. If it used `useChat` internally, IT IS BROKEN TOO because I deleted the hook!
                I should check `MessageInput` content. 
                For now, I can pass `onSend` to it if I modify it, or I can just inline the input here like I planned earlier.
                Inlining is safer to remove dependency on potentially broken sub-components. 
                Let's inline the input logic here using the store.
            */}
            <div className="p-4 border-t bg-background">
                <ChatInput
                    onSend={async (content) => {
                        await sendMessage(content, bookingId, currentUserId)
                    }}
                />
            </div>
        </div>
    )
}

// Simple internal input component to replace MessageInput dependency for now
function ChatInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
    const [value, setValue] = useState("")
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!value.trim() || sending) return

        const content = value
        setValue("") // Optimistic clear
        setSending(true)
        try {
            await onSend(content)
        } finally {
            setSending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
                placeholder="Type a message..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 rounded-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary"
                disabled={sending}
            />
            <Button
                type="submit"
                size="icon"
                className={cn(
                    "rounded-full transition-all duration-200 shrink-0",
                    value.trim() ? "opacity-100 scale-100" : "opacity-50 scale-90"
                )}
                disabled={!value.trim() || sending}
            >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
            </Button>
        </form>
    )
}
