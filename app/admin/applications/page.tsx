
import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/types/supabase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { approveVendor, rejectVendor } from "@/modules/admin/actions"
import { AdminPageHeader } from "@/components/admin/page-header"

export default async function AdminApplicationsPage() {
    const supabase = await createClient()

    // Fetch pending applications
    const { data: applications } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .returns<Tables<'profiles'>[]>()

    return (
        <div className="space-y-6">
            <AdminPageHeader heading="Host Applications" text='"Shop Opening" requests awaiting approval.' />

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!applications || applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No pending applications.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.full_name || 'Anonymous'}</TableCell>
                                    <TableCell>{app.email}</TableCell>
                                    <TableCell>{new Date(app.created_at).toLocaleDateString("en-US")}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                            Pending
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <form action={rejectVendor.bind(null, app.id)} className="inline-block">
                                            <Button size="icon" variant="destructive" title="Reddet">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </form>
                                        <form action={approveVendor.bind(null, app.id)} className="inline-block">
                                            <Button size="icon" variant="default" className="bg-green-600 hover:bg-green-700" title="Onayla">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
