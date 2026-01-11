'use client'

import { useEffect } from "react"
import { sendViewItem, AnalyticsItem } from "@/lib/analytics"

interface ViewItemTrackerProps {
    item: AnalyticsItem
}

export function ViewItemTracker({ item }: ViewItemTrackerProps) {
    useEffect(() => {
        if (item) {
            sendViewItem(item)
        }
    }, [item])

    return null
}
