import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description: string
    action?: {
        label: string
        href: string
    }
}

/**
 * Reusable empty state component for consistent UI across the app.
 * Use when displaying "no results" or "get started" messages.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="rounded-md border p-8 text-center bg-muted/20">
            {icon && (
                <div className="mb-4 flex justify-center">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {description}
            </p>
            {action && (
                <Button asChild>
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </div>
    )
}
