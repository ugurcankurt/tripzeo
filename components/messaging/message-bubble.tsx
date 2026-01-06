import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Check, CheckCheck } from "lucide-react"

interface MessageBubbleProps {
    content: string
    isOwn: boolean
    createdAt: string
    isRead?: boolean // Optional because not all consumers might pass it yet
}

export function MessageBubble({ content, isOwn, createdAt, isRead }: MessageBubbleProps) {
    return (
        <div className={cn(
            "flex w-full mt-2 space-x-3 max-w-sm",
            isOwn ? "ml-auto justify-end" : ""
        )}>
            <div className={cn(
                "group relative px-5 py-3 text-sm shadow-sm",
                isOwn
                    ? "bg-[#ff5a00] text-white rounded-2xl rounded-tr-sm"
                    : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm"
            )}>
                <div className="leading-relaxed">
                    {content}
                </div>
                <div className={cn(
                    "flex items-center justify-end gap-1 mt-1",
                    isOwn ? "text-orange-100/90" : "text-gray-400"
                )}>
                    <span className="text-[10px] font-medium">
                        {format(new Date(createdAt), 'HH:mm')}
                    </span>
                    {isOwn && (
                        <span>
                            {isRead ? (
                                <CheckCheck className="h-3 w-3" />
                            ) : (
                                <Check className="h-3 w-3 opacity-70" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
