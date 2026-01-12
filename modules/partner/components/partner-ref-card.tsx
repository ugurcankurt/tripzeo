'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, QrCode } from "lucide-react"
import { toast } from "sonner"

export function PartnerRefCard({ referralCode }: { referralCode: string }) {
    const link = `https://tripzeo.com/?ref=${referralCode}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link)
        toast.success("Referral link copied to clipboard!")
    }

    return (
        <Card className="bg-gradient-to-r from-orange-50 to-white border-orange-100">
            <CardHeader>
                <CardTitle>Your Referral Assets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex gap-2">
                            <Input value={link} readOnly className="font-mono bg-white" />
                            <Button onClick={copyToClipboard} className="bg-[#FF4F30] hover:bg-[#FF4F30]/90">
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Link
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Share this link on your social media, blog, or with friends. You earn 10% on every booking they make within 30 days.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
