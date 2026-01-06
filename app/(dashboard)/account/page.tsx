import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/guards"
import { ProfileForm } from "./profile-form"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tables } from "@/types/supabase"

interface AccountPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
    const params = await searchParams;
    const error = params.error;
    const supabase = await createClient()

    // Fetch latest profile data
    const { user, profile } = await requireAuth()

    // Sync full_name from Auth Metadata if different
    // This ensures Display Name and Profile Name are always identical
    const authName = user.user_metadata?.full_name || user.user_metadata?.name
    if (authName && profile && profile.full_name !== authName) {
        await supabase.from('profiles').update({ full_name: authName }).eq('id', user.id)
        // Refresh local profile object to show correct data immediately
        profile.full_name = authName
    }

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .returns<Tables<'categories'>[]>()

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h3 className="text-lg font-medium">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your personal information and appearance on Tripzeo.
                </p>
            </div>

            {error === 'incomplete_profile' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profile Incomplete</AlertTitle>
                    <AlertDescription>
                        You must complete your profile (Service Category, Bio, Phone, Bank Info, etc.) before creating a new experience.
                    </AlertDescription>
                </Alert>
            )}

            {error === 'missing_category' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Category</AlertTitle>
                    <AlertDescription>
                        Please select a Service Category to start creating experiences.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-1">
                <Card>
                    <CardContent>
                        <ProfileForm
                            profile={profile}
                            userEmail={user?.email}
                            categories={categories || []}
                        />
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
