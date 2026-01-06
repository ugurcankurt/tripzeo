import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Requires user to be authenticated as admin.
 * Redirects to login if not authenticated, redirects to home if not admin.
 * @returns Object containing authenticated user and admin profile
 */
export async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    return { user, profile }
}

/**
 * Requires user to be authenticated as host (or admin).
 * Redirects to login if not authenticated.
 * @returns Object containing authenticated user and host profile
 * @throws Error if user is not a host or admin
 */
export async function requireHost() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'host' && profile?.role !== 'admin') {
        throw new Error('HOST_ACCESS_REQUIRED')
    }

    return { user, profile }
}

/**
 * Gets authenticated user and profile without enforcing role.
 * Redirects to login if not authenticated.
 * @returns Object containing authenticated user and profile
 */
export async function requireAuth() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return { user, profile }
}
