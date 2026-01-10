
import { Suspense } from "react"
import { NewExperienceFormContainer } from "@/components/vendor/new-experience-form-container"
import { ExperienceFormSkeleton } from "@/components/skeletons/experience-form-skeleton"

export default function NewProductPage() {
    return (
        <Suspense fallback={<ExperienceFormSkeleton />}>
            <NewExperienceFormContainer />
        </Suspense>
    )
}
