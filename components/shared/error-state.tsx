import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorStateProps {
    title: string
    message: string
    action?: {
        label: string
        href: string
    }
}

/**
 * Reusable error state component for unauthorized/error pages.
 * Use for permission errors, not found, etc.
 */
export function ErrorState({ title, message, action }: ErrorStateProps) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{message}</p>
                    {action && (
                        <Button asChild className="mt-4">
                            <Link href={action.href}>{action.label}</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
