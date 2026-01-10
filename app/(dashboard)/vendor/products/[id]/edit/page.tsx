import { Suspense } from "react"
import { EditExperienceFormContainer } from "@/components/vendor/edit-experience-form-container"
import { ExperienceFormSkeleton } from "@/components/skeletons/experience-form-skeleton"

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <Suspense fallback={<ExperienceFormSkeleton />}>
            <EditExperienceFormContainer experienceId={id} />
        </Suspense>
    )
}
