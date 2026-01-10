import { Suspense } from "react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { UsersTable } from "@/components/admin/users-table"
import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton"

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <AdminPageHeader heading="User Management" text="Manage user accounts, roles, and verification statuses." />

            <Suspense fallback={<AdminTableSkeleton columnCount={6} />}>
                <UsersTable />
            </Suspense>
        </div>
    )
}
