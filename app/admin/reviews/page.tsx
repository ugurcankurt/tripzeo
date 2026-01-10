import { Suspense } from "react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ReviewsTable } from "@/components/admin/reviews-table"
import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton"

export default function AdminReviewsPage() {
    return (
        <div className="space-y-6">
            <AdminPageHeader heading="Review Management" text="Manage all reviews submitted on the platform." />

            <Suspense fallback={<AdminTableSkeleton columnCount={8} />}>
                <ReviewsTable />
            </Suspense>
        </div>
    )
}
