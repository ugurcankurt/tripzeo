import { SiteHeader } from "@/components/layout/site-header"

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
            <footer className="border-t py-12 bg-muted/30 print:hidden">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Tripzeo Experiences Marketplace. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
