import { cookies } from "next/headers"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/guards"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { GlobalChatWidget } from "@/components/messaging/global-chat-widget"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    const supabase = await createClient()
    const { profile } = await requireAuth()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const userRole = profile?.role || 'user'

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex min-h-screen w-full">
                <AppSidebar userRole={userRole} />
                <SidebarInset className="flex w-full flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 sticky top-0 z-10">
                        <SidebarTrigger className="-ml-1" />
                        <div className="mr-4 hidden md:flex">
                            <span className="text-sm text-muted-foreground">Welcome, <span className="font-medium text-foreground">{user.user_metadata.full_name || user.email}</span></span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <NotificationBell />
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-8 relative">
                        {children}
                    </main>
                    <GlobalChatWidget currentUserId={user.id} />
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
