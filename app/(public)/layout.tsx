import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="sticky top-0 z-50 w-full print:hidden">
                <SiteHeader />
            </div>
            <main className="flex-1">
                {children}
            </main>
            <SiteFooter />
        </div>
    )
}
