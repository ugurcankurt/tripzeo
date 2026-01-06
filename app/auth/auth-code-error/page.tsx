import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"

export default function AuthCodeError() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-muted/20 px-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <HugeiconsIcon icon={Alert02Icon} className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Authentication Error</h1>
                <p className="max-w-[400px] text-muted-foreground text-sm">
                    We encountered an error while trying to authenticate you. This link may have expired or has already been used.
                </p>
            </div>
            <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                Back to Login
            </Link>
        </div>
    )
}
