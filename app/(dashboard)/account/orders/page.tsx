import { Suspense } from "react"
import { OrdersList } from "@/components/account/orders-list"
import { OrdersSkeleton } from "@/components/skeletons/orders-skeleton"
import { Database } from '@/types/supabase'

type BookingStatus = Database['public']['Enums']['booking_status']

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const chatBookingId = typeof params.chat === 'string' ? params.chat : null

    // GlobalChatWidget handles the '?chat=' param automatically.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
                    <p className="text-muted-foreground">
                        Track your upcoming experiences and past adventures.
                    </p>
                </div>
            </div>

            <Suspense fallback={<OrdersSkeleton />}>
                <OrdersList />
            </Suspense>
        </div>
    )
}
