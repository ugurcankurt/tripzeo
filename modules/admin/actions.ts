'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveVendor(vendorId: string) {
    const supabase = await createClient()

    // RLS ensures only admins can perform this update
    const { error } = await supabase
        .from('profiles')
        .update({
            role: 'host',
            verification_status: 'verified',
            updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

    if (error) {
        console.error("Error approving vendor:", error)
        throw new Error("Failed to approve vendor")
    }

    revalidatePath('/admin/applications')
    revalidatePath(`/admin/users/${vendorId}`) // Optional: if there's a detail page
}

export async function rejectVendor(vendorId: string) {
    const supabase = await createClient()

    // RLS ensures only admins can perform this update
    const { error } = await supabase
        .from('profiles')
        .update({
            verification_status: 'rejected',
            updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

    if (error) {
        console.error("Error rejecting vendor:", error)
        throw new Error("Failed to reject vendor")
    }

    revalidatePath('/admin/applications')
}
export async function getVendorDetails(vendorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('profiles').select('*').eq('id', vendorId).single()
    return { data, error }
}


export async function updateUserRole(userId: string, newRole: 'user' | 'host' | 'admin') {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') return { error: "Unauthorized" }

    // 2. Update Role
    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) {
        console.error("Error updating role:", error)
        return { error: "Failed to update role" }
    }

    revalidatePath('/admin/users')
    return { success: "User role updated successfully" }
}

import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function deleteUser(userId: string) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') return { error: "Unauthorized" }

    // 2. Delete User (Requires Service Role to delete from Auth)
    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error("Error deleting user:", error)
        return { error: "Failed to delete user" }
    }

    revalidatePath('/admin/users')
    return { success: "User deleted successfully" }
}
