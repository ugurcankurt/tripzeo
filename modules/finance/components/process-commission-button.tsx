'use client'

import { Button } from "@/components/ui/button"
import { markCommissionAsPaid } from "@/modules/finance/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ProcessCommissionButtonProps {
    transactionId: string
    amount: number
    currency: string | null
}

export function ProcessCommissionButton({ transactionId, amount, currency }: ProcessCommissionButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleProcess = async () => {
        try {
            setIsLoading(true)
            const result = await markCommissionAsPaid(transactionId)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Commission marked as paid")
            router.refresh()
        } catch (error) {
            toast.error("Failed to process commission")
        } finally {
            setIsLoading(false)
        }
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
    }).format(amount)

    return (
        <Button
            size="sm"
            onClick={handleProcess}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay {formattedAmount}
        </Button>
    )
}
