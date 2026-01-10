import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from 'next/navigation'
import { ExperienceForm } from "@/modules/experiences/components/experience-form"
import { requireAuth } from "@/lib/auth/guards"
import { Tables } from "@/types/supabase"

export async function EditExperienceFormContainer({ experienceId }: { experienceId: string }) {
    const supabase = await createClient()

    const { user } = await requireAuth()

    // Fetch User Profile to check Category
    const { data: profile } = await supabase
        .from('profiles')
        .select('category_id')
        .eq('id', user.id)
        .single()

    let fixedCategoryName: string | undefined

    if (profile?.category_id) {
        const { data: cat } = await supabase
            .from('categories')
            .select('name')
            .eq('id', profile.category_id)
            .single()

        if (cat) fixedCategoryName = cat.name
    }

    const { data: experience } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', experienceId)
        .eq('host_id', user.id)
        .single()

    if (!experience) {
        notFound()
    }

    // Fetch categories for the form
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .returns<Tables<'categories'>[]>()

    const sanitizedExperience = {
        ...experience,
        category: experience.category || '',
        location_city: experience.location_city || '',
        location_country: experience.location_country || '',
        location_address: experience.location_address || '',
        location_state: experience.location_state || null,
        images: experience.images || [],
        start_time: experience.start_time ? experience.start_time.slice(0, 5) : "09:00"
    }

    return (
        <ExperienceForm
            initialData={sanitizedExperience}
            commissionRate={0}
            categories={categories || []}
            fixedCategory={fixedCategoryName}
        />
    )
}
