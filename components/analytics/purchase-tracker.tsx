'use client'

import { useEffect } from "react"
import { sendPurchase } from "@/lib/analytics"
import { useRouter, useSearchParams } from "next/navigation"

interface PurchaseTrackerProps {
    bookingId: string
    transactionId: string
    value: number
    currency: string
    items: {
        item_id: string
        item_name: string
        price: number
        quantity: number
        item_category: string
    }[]
}

export function PurchaseTracker({ bookingId, transactionId, value, currency, items }: PurchaseTrackerProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Fire the event
        sendPurchase(transactionId, value, currency, items)

        // Optional: Clean up URL to prevent duplicate tracking on refresh
        // For now, we rely on the fact that GA4 usually dedupes same transaction_id
        // But removing params is cleaner UX.
        // const newParams = new URLSearchParams(searchParams.toString())
        // newParams.delete('payment')
        // newParams.delete('booking_id')
        // router.replace(`/account/orders?${newParams.toString()}`, { scroll: false })

    }, [bookingId, transactionId, value, currency, items]) // formatting dependencies

    return null // Invisible component
}
