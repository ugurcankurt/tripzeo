
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminUserActions } from "@/modules/admin/components/user-actions"
import { AdminPageHeader } from "@/components/admin/page-header"

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<Tables<'profiles'>[]>()

    return (
        <div className="space-y-6">
            <AdminPageHeader heading="User Management" />

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profile</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar_url || ''} />
                                        <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{user.full_name}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'host' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.verification_status === 'verified' ? (
                                        <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">Standard</span>
                                    )}
                                </TableCell>
                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <AdminUserActions profile={user} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
