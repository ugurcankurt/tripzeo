'use client'

import { useEffect } from "react"
import { sendViewItemList, AnalyticsItem } from "@/lib/analytics"

interface ViewItemListTrackerProps {
    items: AnalyticsItem[]
    listName?: string
}

export function ViewItemListTracker({ items, listName = 'Search Results' }: ViewItemListTrackerProps) {
    useEffect(() => {
        if (items && items.length > 0) {
            sendViewItemList(items, listName)
        }
    }, [items, listName])

    return null
}
