import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/types/supabase"
import { requireAuth } from "@/lib/auth/guards"
import { notFound, redirect } from "next/navigation"
import { AvailabilityCalendar } from "@/modules/availability/components/availability-calendar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AvailabilityPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params
    const { user } = await requireAuth()

    const { data: experience } = await supabase
        .from('experiences')
        .select('title, host_id')
        .eq('id', id)
        .single() // .single returns T not T[] so returns<T>() is correct? No, returns check generic. Usually returns<Type>() is for rows. .single() transforms to single. Correct way is .returns<Type>() where Type is the Row shape.
        // Actually supabase js client types: .returns<T>() sets data type to T (if single, T; if list, T[]). Wait, typically T represents the row.
        // Let's use Pick<Tables<'experiences'>, 'title' | 'host_id'>
        // BUT: for single() it might expect the single object type? 
        // No, returns() overrides the R generic which is usually result array or single based on method chain. 
        // If I put returns<T>(), and use single(), data will be T. 
        // If I put returns<T[]>(), and use single(), data might be T (types are smart). 
        // Let's try returns<Pick...>() without array brackets because .select() usually returns array, but single makes it object. 
        // Safe bet: .returns<Pick<Tables<'experiences'>, 'title' | 'host_id'>>() 
        // Wait, strict mode usually wants the row type passed to returns.
        .returns<Pick<Tables<'experiences'>, 'title' | 'host_id'>>()

    if (!experience) notFound()

    if (experience.host_id !== user.id) redirect('/vendor')

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0">
                    <Link href={`/vendor`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{experience.title}</h1>
                <p className="text-muted-foreground">Manage Availability</p>
            </div>

            <AvailabilityCalendar experienceId={id} />
        </div>
    )
}
