import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { Briefcase } from "lucide-react"
import { UserNav } from "@/components/layout/user-nav"
import { CartButton } from "@/components/layout/cart-button"
import { HeaderSearch } from "@/components/layout/header-search"

export async function SiteHeader() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userProfile = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url, role, category:categories(icon)')
            .eq('id', user.id)
            .single()
        userProfile = profile
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-1 font-semibold text-2xl tracking-tighter text-primary">
                        <Image
                            src="/tripzeo.svg"
                            alt="tripzeo logo"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                        />
                        tripzeo
                    </Link>

                    <HeaderSearch />
                </div>

                <div className="flex items-center gap-4">
                    {!userProfile && (
                        <Button variant="outline" size="sm" className="hidden md:flex gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary" asChild>
                            <Link href="/vendor">
                                <Briefcase className="h-4 w-4" />
                                <span>Become a Host</span>
                            </Link>
                        </Button>
                    )}

                    {/* Cart Button for Pending Bookings */}
                    {userProfile && <CartButton />}

                    {userProfile ? (
                        <UserNav user={userProfile} />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Log In</Link>
                            </Button>
                            <Button asChild className="rounded-full">
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
