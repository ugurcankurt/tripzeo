"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

import { Tables } from "@/types/supabase"

type PayoutWithHost = Pick<Tables<'bookings'>, 'id' | 'host_earnings' | 'status'> & {
    host: Tables<'profiles'>
}

export function ExportPayoutsButton({ payouts }: { payouts: PayoutWithHost[] }) {

    // Function to convert payout data to Wise Bulk Payment CSV format
    // Ref: Wise Batch Payment Template 
    // Usually: recipientEmail, recipientName, currency, amount, paymentReference, bankDetails...
    const handleExport = () => {
        // Define Headers
        // Rough standard fields for a generic CSV that can be mapped
        const headers = [
            "Recipient Name",
            "Currency",
            "Payment Amount",
            "Payment Reference",
            "Recipient Email",
            "Bank Country",
            "IBAN",
            "BIC/SWIFT",
            "Routing Number (ABA)",
            "Account Number",
            "Bank Name"
        ]

        const rows = payouts.filter(p => p.status !== 'paid_out').map(p => {
            const host = p.host;
            return [
                `"${host.account_holder || host.full_name}"`, // Quote for safety
                "USD", // Payout Currency
                p.host_earnings.toFixed(2),
                `"${p.id}"`, // Reference
                host.email,
                host.bank_country || "TR",
                host.iban || "",
                host.bank_code || "",
                host.routing_number || "", // Exclusive to US
                host.account_number || "", // Exclusive to US
                `"${host.bank_name || ""}"`
            ].join(",")
        })

        const csvContent = headers.join(",") + "\n" + rows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `payouts_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export for Wise (CSV)
        </Button>
    )
}
