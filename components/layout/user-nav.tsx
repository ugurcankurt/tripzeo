'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { CreditCard, LayoutDashboard, LogOut, Settings, User, ShoppingBag, Heart } from "lucide-react"
import { signout } from "@/modules/auth/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UserNavProps {
    user: {
        id: string
        email: string
        full_name?: string | null
        avatar_url?: string | null
        role?: 'user' | 'host' | 'admin' | null
        category?: { icon: string | null } | any
    }
}

export function UserNav({ user }: UserNavProps) {
    const router = useRouter()
    const handleSignOut = async () => {
        try {
            const result = await signout()
            if (result?.success) {
                toast.success("Signed out successfully")
                router.refresh()
                router.push('/login')
            }
        } catch (error) {
            toast.error("Error signing out")
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-muted">
                        <AvatarImage src={user.avatar_url || user.category?.icon || ''} alt={user.full_name || ''} className="object-contain" />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/account">
                            <User className="mr-2 h-4 w-4" />
                            <span>My Account</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/account/orders">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            <span>My Bookings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/account/favorites">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>My Favorites</span>
                        </Link>
                    </DropdownMenuItem>
                    {/* Eğer Host ise Panel linkini göster */}
                    {(user.role === 'host' || user.role === 'admin') && (
                        <DropdownMenuItem asChild className="bg-primary/5 focus:bg-primary/10 mt-1">
                            <Link href="/vendor" className="font-medium text-primary">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Host Panel</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {/* Eğer Admin ise Admin Paneli linkini göster */}
                    {user.role === 'admin' && (
                        <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                            <Link href="/admin">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Admin Panel</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
