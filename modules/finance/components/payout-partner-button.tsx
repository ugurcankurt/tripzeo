'use client'

import { Button } from "@/components/ui/button"
import { payoutPartner } from "@/modules/finance/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface PayoutPartnerButtonProps {
    partnerId: string
    amount: number
    currency: string | null
}

export function PayoutPartnerButton({ partnerId, amount, currency }: PayoutPartnerButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handlePayout = async () => {
        if (amount < 150) {
            toast.error("Minimum payout threshold is $150.")
            return
        }

        try {
            setIsLoading(true)
            const result = await payoutPartner(partnerId)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("All pending commissions paid out.")
            router.refresh()
        } catch (error) {
            toast.error("Failed to process payout")
        } finally {
            setIsLoading(false)
        }
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
    }).format(amount)

    const isDisabled = amount < 150 || isLoading

    return (
        <Button
            size="sm"
            onClick={handlePayout}
            disabled={isDisabled}
            className={isDisabled ? "opacity-50" : "bg-green-600 hover:bg-green-700 text-white"}
            variant={isDisabled ? "secondary" : "default"}
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay {formattedAmount}
        </Button>
    )
}
