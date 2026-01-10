import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AccountFormContainer } from "./account-form-container"
import { ProfileFormSkeleton } from "@/components/skeletons/profile-form-skeleton"

interface AccountPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
    const params = await searchParams;
    const error = params.error;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your personal information and appearance on Tripzeo.
                    </p>
                </div>
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
                    <CardContent className="pt-6">
                        <Suspense fallback={<ProfileFormSkeleton />}>
                            <AccountFormContainer />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
