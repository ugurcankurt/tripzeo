import { ExperienceForm } from "@/modules/experiences/components/experience-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/guards"
import { Tables } from "@/types/supabase"

export async function NewExperienceFormContainer() {
    const supabase = await createClient()
    const { user, profile } = await requireAuth()

    // Check for incomplete profile
    const requiredFields = ['full_name', 'bio', 'phone', 'iban', 'bank_name', 'account_holder'] as const
    const isProfileComplete = requiredFields.every(field => profile?.[field])

    if (!isProfileComplete) {
        // Redirection should happen in page or middleware, but for simplicity we keep it here if it's rendered
        redirect('/account?error=incomplete_profile')
    }

    let fixedCategoryName: string | undefined

    if (profile?.category_id) {
        const { data: cat } = await supabase
            .from('categories')
            .select('name')
            .eq('id', profile.category_id)
            .single()

        if (cat) fixedCategoryName = cat.name
    } else if (profile?.role === 'host') {
        // Enforce Category Selection for Hosts
        redirect('/account?error=missing_category')
    }

    // Fetch categories for the form
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .returns<Tables<'categories'>[]>()

    return (
        <ExperienceForm
            commissionRate={0}
            categories={categories || []}
            fixedCategory={fixedCategoryName}
        />
    )
}
