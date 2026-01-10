import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/guards"
import { ProfileForm } from "@/app/(dashboard)/account/profile-form"
import { Tables } from "@/types/supabase"

export async function AccountFormContainer() {
    const supabase = await createClient()

    // Fetch latest profile data
    const { user, profile } = await requireAuth()

    // Sync full_name from Auth Metadata if different
    const authName = user.user_metadata?.full_name || user.user_metadata?.name
    if (authName && profile && profile.full_name !== authName) {
        await supabase.from('profiles').update({ full_name: authName }).eq('id', user.id)
        profile.full_name = authName
    }

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .returns<Tables<'categories'>[]>()

    return (
        <ProfileForm
            profile={profile}
            userEmail={user?.email}
            categories={categories || []}
        />
    )
}
