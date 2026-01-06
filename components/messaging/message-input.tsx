'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { messageSchema, type MessageFormValues } from "@/modules/messaging/schema"
import { toast } from "sonner"
import { sendMessage } from "@/modules/messaging/actions"

interface MessageInputProps {
    bookingId: string
    onSent?: () => void
}

export function MessageInput({ bookingId, onSent }: MessageInputProps) {
    const [isSending, setIsSending] = useState(false)
    const { register, handleSubmit, reset, formState: { errors } } = useForm<MessageFormValues>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            bookingId: bookingId,
            content: ""
        }
    })

    const onSubmit = async (data: MessageFormValues) => {
        setIsSending(true)
        try {
            const result = await sendMessage(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                // toast.success("Message sent")
                reset({ bookingId: bookingId, content: "" })
                onSent?.()
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-white border-t flex items-center gap-3">
            <input type="hidden" {...register("bookingId")} />
            <div className="flex-1 relative">
                <Textarea
                    {...register("content")}
                    placeholder="Type a message..."
                    className="min-h-[48px] max-h-[120px] resize-none rounded-full bg-gray-50 border-gray-100 focus-visible:ring-1 focus-visible:ring-orange-500/30 px-6 py-3.5 shadow-sm scrollbar-hide text-sm"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit(onSubmit)()
                        }
                    }}
                />
            </div>
            <Button
                type="submit"
                size="icon"
                disabled={isSending}
                className="h-12 w-12 rounded-full bg-[#ff5a00] hover:bg-[#ff5a00]/90 text-white shrink-0 shadow-sm transition-transform active:scale-95"
            >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendIcon className="h-5 w-5 ml-0.5" />}
            </Button>
        </form>
    )
}
