import { Database } from "@/types/supabase"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function BookingStatusBadge({ status }: { status: Database['public']['Enums']['booking_status'] | string }) {
    const styles: Record<string, { label: string, className: string }> = {
        pending_payment: {
            label: "Pending Payment",
            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
        },
        pending_host_approval: {
            label: "Awaiting Approval",
            className: "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"
        },
        confirmed: {
            label: "Confirmed",
            className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
        },
        completed: {
            label: "Completed",
            className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
        },
        rejected: {
            label: "Rejected",
            className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
        },
        cancelled_by_host: {
            label: "Cancelled by Host",
            className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
        },
        cancelled_by_user: {
            label: "Cancelled by Traveler",
            className: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
        },
        payment_failed: {
            label: "Payment Failed",
            className: "bg-red-50 text-red-900 border-red-200"
        }
    }

    const config = styles[status] || {
        label: status.replace(/_/g, " "),
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }

    return (
        <Badge variant="outline" className={cn("font-medium", config.className)}>
            {config.label}
        </Badge>
    )
}
