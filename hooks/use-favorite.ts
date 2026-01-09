"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toggleFavorite } from "@/modules/favorites/actions"
import { toast } from "sonner"

const STORAGE_KEY = 'tripzeo_favorites'

export function useFavorite(experienceId: string, initialIsFavorited: boolean = false) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
    const [isLoading, setIsLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuthAndStatus()
    }, [experienceId])

    const checkAuthAndStatus = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        setIsAuthenticated(!!user)

        if (user) {
            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('experience_id', experienceId)
                .single()

            setIsFavorited(!!data)
        } else {
            // Check local storage
            const localFavorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
            setIsFavorited(localFavorites.includes(experienceId))
        }
    }

    const toggle = async (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()

        setIsLoading(true)

        try {
            if (isAuthenticated) {
                // Optimistic update
                setIsFavorited(!isFavorited)

                const result = await toggleFavorite(experienceId)
                if (result.error) {
                    // Revert on error
                    setIsFavorited(isFavorited)
                    toast.error("Failed to update favorite")
                }
            } else {
                // Local storage logic
                const localFavorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
                let newFavorites

                if (isFavorited) {
                    newFavorites = localFavorites.filter((id: string) => id !== experienceId)
                } else {
                    newFavorites = [...localFavorites, experienceId]
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites))
                setIsFavorited(!isFavorited)
                toast.success(isFavorited ? "Removed from favorites" : "Saved to favorites")
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return { isFavorited, toggle, isLoading }
}
