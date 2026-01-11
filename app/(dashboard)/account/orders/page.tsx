import { Suspense } from "react"
import { OrdersList } from "@/components/account/orders-list"
import { OrdersSkeleton } from "@/components/skeletons/orders-skeleton"
import { Database } from '@/types/supabase'
import { createClient } from "@/lib/supabase/server"
import { PurchaseTracker } from "@/components/analytics/purchase-tracker"

type BookingStatus = Database['public']['Enums']['booking_status']

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const chatBookingId = typeof params.chat === 'string' ? params.chat : null

    // Purchase Tracking Logic
    const paymentStatus = typeof params.payment === 'string' ? params.payment : null
    const bookingId = typeof params.booking_id === 'string' ? params.booking_id : null

    let purchaseData = null

    if (paymentStatus === 'success' && bookingId) {
        const supabase = await createClient()
        const { data: booking } = await supabase
            .from('bookings')
            .select('*, experience:experiences(title, price, category, currency)')
            .eq('id', bookingId)
            .single()

        if (booking) {
            purchaseData = {
                bookingId: booking.id,
                transactionId: booking.id, // Use booking UUID as transaction ID
                value: booking.total_amount,
                currency: booking.experience?.currency || 'USD',
                items: [{
                    item_id: booking.experience_id,
                    item_name: booking.experience?.title || 'Experience',
                    price: booking.experience?.price || 0,
                    quantity: booking.attendees_count || 1,
                    item_category: booking.experience?.category || 'General'
                }]
            }
        }
    }

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

            {purchaseData && (
                <PurchaseTracker {...purchaseData} />
            )}

            <Suspense fallback={<OrdersSkeleton />}>
                <OrdersList />
            </Suspense>
        </div>
    )
}
