'use client'

import { Gauge, User, ShoppingBag, LogOut, Briefcase, CreditCard, FileText, Calendar, Users, ChartLine, Settings, Tags } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"
import { signout } from "@/modules/auth/actions"



export function AppSidebar({ userRole = 'user' }: { userRole?: 'user' | 'host' | 'admin' }) {
    const pathname = usePathname()
    const router = useRouter()

    const isAdminPage = pathname.startsWith('/admin')

    return (
        <Sidebar className="border-r">
            <SidebarHeader className="h-16 border-b px-6 flex items-center">
                <Link href="/" className="font-bold text-xl tracking-tight">tripzeo</Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className="px-4 py-4 space-y-1">

                    {/* ADMIN SIDEBAR MODE */}
                    {isAdminPage ? (
                        <>
                            <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Admin Panel
                            </div>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin"} className="w-full justify-start">
                                    <Link href="/admin">
                                        <Gauge className="mr-2 h-4 w-4" />
                                        Overview
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/finance"} className="w-full justify-start">
                                    <Link href="/admin/finance">
                                        <ChartLine className="mr-2 h-4 w-4" />
                                        Finance Reports
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/categories"} className="w-full justify-start">
                                    <Link href="/admin/categories">
                                        <Tags className="mr-2 h-4 w-4" />
                                        Categories
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/applications"} className="w-full justify-start">
                                    <Link href="/admin/applications">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Applications
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/reviews"} className="w-full justify-start">
                                    <Link href="/admin/reviews">
                                        <Users className="mr-2 h-4 w-4" />
                                        Reviews
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/bookings"} className="w-full justify-start">
                                    <Link href="/admin/bookings">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Bookings
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/users"} className="w-full justify-start">
                                    <Link href="/admin/users">
                                        <Users className="mr-2 h-4 w-4" />
                                        Users
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/payouts"} className="w-full justify-start">
                                    <Link href="/admin/payouts">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Payouts & Payments
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/admin/settings"} className="w-full justify-start">
                                    <Link href="/admin/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Platform Settings
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="w-full justify-start mt-4 text-muted-foreground hover:text-foreground">
                                    <Link href="/dashboard">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Back to Site
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    ) : (
                        /* NORMAL USER / HOST SIDEBAR MODE */
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/account"} className="w-full justify-start">
                                    <Link href="/account">
                                        <User className="mr-2 h-4 w-4" />
                                        My Account
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {!pathname.startsWith('/vendor') && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={pathname === "/account/orders"} className="w-full justify-start">
                                        <Link href="/account/orders">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            My Bookings
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {/* Usta/Vendor Menüsü */}
                            {(userRole === 'host' || userRole === 'admin') && (
                                <>
                                    <div className="mt-8 mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Host Panel
                                    </div>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={pathname === "/vendor"} className="w-full justify-start">
                                            <Link href="/vendor">
                                                <Briefcase className="mr-2 h-4 w-4" />
                                                My Shop
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={pathname === "/vendor/bookings"} className="w-full justify-start">
                                            <Link href="/vendor/bookings">
                                                <ShoppingBag className="mr-2 h-4 w-4" />
                                                Incoming Orders
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={pathname === "/vendor/calendar"} className="w-full justify-start">
                                            <Link href="/vendor/calendar">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Availability Calendar
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={pathname === "/vendor/finance"} className="w-full justify-start">
                                            <Link href="/vendor/finance">
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Finance & Earnings
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}

                            {/* Normal Kullanıcılar İçin 'Usta Ol' Linki */}
                            {userRole === 'user' && (
                                <SidebarMenuItem className="mt-6">
                                    <SidebarMenuButton asChild className="w-full justify-start border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium py-6">
                                        <Link href="/vendor">
                                            <Briefcase className="mr-2 h-5 w-5" />
                                            <span>Become a Host & Earn</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {/* Admin Link on Normal Sidebar */}
                            {userRole === 'admin' && (
                                <>
                                    <div className="mt-8 mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Administration
                                    </div>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={false} className="w-full justify-start">
                                            <Link href="/admin">
                                                <Gauge className="mr-2 h-4 w-4" />
                                                Go to Admin Panel
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                        </>
                    )}

                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={async () => {
                        try {
                            await signout()
                            toast.success("Signed out successfully")
                            router.push('/login')
                        } catch (error) {
                            toast.error("Error signing out")
                        }
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
