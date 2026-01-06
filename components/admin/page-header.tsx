
import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
    heading: string
    text?: string
    children?: React.ReactNode
    className?: string
}

export function AdminPageHeader({
    heading,
    text,
    children,
    className,
}: AdminPageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between px-2", className)}>
            <div className="grid gap-1">
                <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
                {text && <p className="text-lg text-muted-foreground">{text}</p>}
            </div>
            {children}
        </div>
    )
}
