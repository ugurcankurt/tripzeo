"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { processPayout } from "../actions"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface PayoutActionsProps {
    bookingId: string
}

export function PayoutActions({ bookingId }: PayoutActionsProps) {
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const supabase = createClient()

    const handleProcess = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent closing if we are handling it manually, specifically for upload errors

        if (!file) {
            // Optional: Require file? User said "I will upload". Let's make it optional but recommended.
            // Actually, let's proceed without file if not present, or warn. I'll just proceed.
            // But if user WANTS to upload, they select it.
        }

        setLoading(true)
        let receiptUrl: string | undefined = undefined

        try {
            if (file) {
                const fileName = `receipts/${bookingId}-${Date.now()}.pdf`
                const { error: uploadError } = await supabase.storage
                    .from('public_assets')
                    .upload(fileName, file)

                if (uploadError) {
                    toast.error("Failed to upload receipt file")
                    setLoading(false)
                    return
                }

                const { data: publicUrlData } = supabase.storage
                    .from('public_assets')
                    .getPublicUrl(fileName)

                receiptUrl = publicUrlData.publicUrl
            }

            const result = await processPayout(bookingId, receiptUrl)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Payout marked as completed")
                setFile(null)
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" variant="default" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Process"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Mark Payout as Completed?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4">
                            <p>
                                This will mark the booking as paid. Ensure you have manually transferred the funds to the host via their bank/IBAN details.
                            </p>
                            <div className="p-3 bg-muted rounded-md text-xs font-mono">
                                <strong>Booking ID:</strong> {bookingId.slice(0, 8)}...
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="receipt-upload" className="font-semibold text-foreground">Upload Receipt (PDF)</Label>
                                <Input
                                    id="receipt-upload"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-muted-foreground">Optional. Uploading the bank transfer receipt helps the host track payments.</p>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleProcess} className="bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Payment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
