"use client"

import { useEffect } from "react"
import { syncFavorites } from "@/modules/favorites/actions"

const STORAGE_KEY = 'tripzeo_favorites'

export function FavoritesSyncer() {
    useEffect(() => {
        const sync = async () => {
            const localFavorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

            if (localFavorites.length > 0) {
                try {
                    await syncFavorites(localFavorites)
                    // Clear local storage after successful sync
                    localStorage.removeItem(STORAGE_KEY)
                    console.log("Favorites synced successfully")
                } catch (error) {
                    console.error("Failed to sync favorites:", error)
                }
            }
        }

        sync()
    }, [])

    return null // This component doesn't render anything
}
