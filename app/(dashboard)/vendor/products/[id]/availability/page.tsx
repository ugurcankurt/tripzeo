import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/types/supabase"
import { requireAuth } from "@/lib/auth/guards"
import { notFound, redirect } from "next/navigation"
// import { AvailabilityCalendar } from "@/modules/availability/components/availability-calendar"
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
        .single()
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

            {/* <AvailabilityCalendar experienceId={id} /> */}
            <div className="p-10 text-center border border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">Availability Calendar component is missing. Please restore module.</p>
            </div>
        </div>
    )
}
