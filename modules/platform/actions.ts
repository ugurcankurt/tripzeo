'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePlatformSetting(key: string, value: number) {
    const supabase = await createClient()

    // RLS ensures only admins can perform this update
    const { error } = await supabase
        .from('platform_settings')
        .update({
            value: value,
            updated_at: new Date().toISOString()
        })
        .eq('key', key)

    if (error) {
        console.error("Error updating setting:", error)
        return { error: "Failed to update setting" }
    }

    revalidatePath('/admin/settings')
    return { success: "Setting updated" }
}

export async function getPlatformSettings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('key')

    if (error) {
        console.error("Error fetching settings:", error)
        return []
    }

    return data
}
