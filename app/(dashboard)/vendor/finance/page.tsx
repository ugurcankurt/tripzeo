import { Suspense } from "react"
import { FinanceDashboard } from "@/components/vendor/finance-dashboard"
import { FinanceSkeleton } from "@/components/skeletons/finance-skeleton"
import { requireHost } from "@/lib/auth/guards"
import { ErrorState } from "@/components/shared/error-state"

export default async function VendorFinancePage() {
    let user, profile

    try {
        const result = await requireHost()
        user = result.user
        profile = result.profile
    } catch (error: unknown) {
        const isHostError = error && typeof error === 'object' && 'message' in error && (error as any).message === 'HOST_ACCESS_REQUIRED';
        if (isHostError) {
            return (
                <ErrorState
                    title="Unauthorized Access"
                    message="You must have a Host (Vendor) account to view this page."
                    action={{
                        label: "Go to Dashboard",
                        href: "/"
                    }}
                />
            )
        }
        throw error
    }

    if (!profile?.iban) {
        return (
            <ErrorState
                title="Missing Bank Information"
                message="Please complete your IBAN and bank account details to view your earnings and receive payments."
                action={{
                    label: "Complete Information",
                    href: "/account"
                }}
            />
        )
    }

    return (
        <Suspense fallback={<FinanceSkeleton />}>
            <FinanceDashboard />
        </Suspense>
    )
}
