'use client'

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { useEffect } from "react"
import { getPendingBookingsCount } from "@/modules/bookings/actions"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function CartButton() {
    const { count, setCount } = useCartStore()

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const pendingCount = await getPendingBookingsCount()
                setCount(pendingCount)
            } catch (error) {
                console.error("Failed to fetch cart count", error)
            }
        }
        fetchCount()
    }, [setCount])

    if (count === 0) return null

    return (
        <Button
            variant="outline"
            size="icon"
            className={cn(
                "relative rounded-full border-2 border-primary/20",
                "hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all duration-300"
            )}
            asChild
        >
            <Link href="/account/orders?status=pending_payment">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                    {count}
                </span>
                <span className="sr-only">Cart</span>
            </Link>
        </Button>
    )
}
