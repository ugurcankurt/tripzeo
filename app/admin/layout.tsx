import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { requireAdmin } from "@/lib/auth/guards"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { profile } = await requireAdmin()

    return (
        <SidebarProvider>
            <AppSidebar userRole={profile?.role || 'admin'} />
            <div className="flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background z-10">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/admin">Admin Panel</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex-1 p-6 md:p-8 bg-muted/10">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
