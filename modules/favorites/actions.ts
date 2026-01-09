'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFavorite(experienceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Check if favorite exists
    const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('experience_id', experienceId)
        .single()

    if (existingFavorite) {
        // Remove favorite
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', existingFavorite.id)

        if (error) {
            console.error("Error removing favorite:", error)
            return { error: "Failed to remove favorite" }
        }
    } else {
        // Add favorite
        const { error } = await supabase
            .from('favorites')
            .insert({
                user_id: user.id,
                experience_id: experienceId
            })

        if (error) {
            console.error("Error adding favorite:", error)
            return { error: "Failed to add favorite" }
        }
    }

    revalidatePath('/account/favorites')
    return { success: true, isFavorited: !existingFavorite }
}

export async function getFavorites() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data } = await supabase
        .from('favorites')
        .select('experience_id')
        .eq('user_id', user.id)

    return data?.map(f => f.experience_id) || []
}

export async function syncFavorites(experienceIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !experienceIds.length) {
        return { success: false }
    }

    // Fetch existing favorites to avoid duplicates (though unique constraint handles it, this is cleaner)
    const { data: existing } = await supabase
        .from('favorites')
        .select('experience_id')
        .eq('user_id', user.id)
        .in('experience_id', experienceIds)

    const existingIds = new Set(existing?.map(f => f.experience_id) || [])
    const newIds = experienceIds.filter(id => !existingIds.has(id))

    if (newIds.length === 0) {
        return { success: true }
    }

    const { error } = await supabase
        .from('favorites')
        .insert(
            newIds.map(id => ({
                user_id: user.id,
                experience_id: id
            }))
        )

    if (error) {
        console.error("Error syncing favorites:", error)
        return { error: "Failed to sync favorites" }
    }

    return { success: true }
}
