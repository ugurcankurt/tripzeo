'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Loader2, Printer } from "lucide-react"
import { fetchReceiptData } from "@/modules/finance/actions"
import { toast } from "sonner"

export function ReceiptButton({ transferId }: { transferId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)

    const handleOpen = async () => {
        if (!transferId || transferId === 'PAID_OUT_MANUALLY') {
            toast.error("Receipt not available for manual payouts.")
            return
        }

        setOpen(true)
        if (!data) {
            setLoading(true)
            const result = await fetchReceiptData(transferId)
            setLoading(false)
            if (result.error) {
                toast.error(result.error)
                setOpen(false)
            } else {
                setData(result.data)
            }
        }
    }

    const printReceipt = () => {
        window.print()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleOpen} className="gap-2 text-blue-600 hover:text-blue-800 p-0 h-auto">
                    <FileText className="w-4 h-4" />
                    Receipt
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Transfer Receipt</DialogTitle>
                    <DialogDescription>Official proof of payment.</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : data ? (
                    <div className="space-y-4 text-sm" id="receipt-print-area">
                        <div className="border rounded-md p-4 bg-slate-50 space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-bold text-lg">{data.amount} {data.currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-medium capitalize text-green-600">{data.status?.replace(/_/g, " ")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span>{data.created ? new Date(data.created).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="text-muted-foreground">Processor:</span>
                                <span>{data.processorName || "Wise Inc."}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reference:</span>
                                <span className="font-mono">{data.bankingPartnerReference || "N/A"}</span>
                            </div>
                            {data.mt103 && (
                                <div className="pt-2">
                                    <span className="text-muted-foreground block mb-1">MT103 / SWIFT:</span>
                                    <code className="block bg-black text-white p-2 rounded text-[10px] break-all">
                                        {data.mt103}
                                    </code>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 print:hidden">
                            {data.receiptUrl && (
                                <Button variant="default" size="sm" onClick={() => window.open(data.receiptUrl, '_blank')}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Original PDF
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={printReceipt}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-red-500">Failed to load receipt data.</div>
                )}
            </DialogContent>
        </Dialog>
    )
}
