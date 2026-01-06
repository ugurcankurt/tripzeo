
import { getPlatformSettings } from '@/modules/platform/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsForm } from '@/modules/platform/components/settings-form'
import { AdminPageHeader } from "@/components/admin/page-header"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const settings = await getPlatformSettings()

    return (
        <div className="space-y-6">
            <AdminPageHeader heading="Platform Settings" text="Configure global platform settings, commissions, and service fees." />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Commission & Fees</CardTitle>
                        <CardDescription>
                            Configure global commission rates and service fees.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SettingsForm settings={settings} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
