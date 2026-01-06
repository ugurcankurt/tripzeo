'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tables } from "@/types/supabase"

interface UserDetailsDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    profile: Tables<'profiles'>
}

export function UserDetailsDialog({ isOpen, onOpenChange, profile }: UserDetailsDialogProps) {
    if (!profile) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>
                        Complete profile information for {profile.full_name || 'User'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full max-h-[60vh] pr-4">
                    <div className="grid gap-6 py-4">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium leading-none text-muted-foreground">Personal Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="font-semibold">Full Name:</span>
                                    <p>{profile.full_name || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Email:</span>
                                    <p>{profile.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Phone:</span>
                                    <p>{profile.phone || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Role:</span>
                                    <p className="capitalize">{profile.role}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />

                        {/* Address */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium leading-none text-muted-foreground">Location</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="font-semibold">Address:</span>
                                    <p>{profile.address || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">City/State:</span>
                                    <p>{[profile.city, profile.state, profile.zip_code].filter(Boolean).join(', ') || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Country:</span>
                                    <p>{profile.country || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />

                        {/* Financial / Bank Info (Mostly relevant for hosts) */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium leading-none text-muted-foreground">Financial Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="font-semibold">IBAN:</span>
                                    <p className="font-mono">{profile.iban || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Bank Name:</span>
                                    <p>{profile.bank_name || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Account Holder:</span>
                                    <p>{profile.account_holder || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Wise ID:</span>
                                    <p>{profile.wise_recipient_id || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />

                        {/* System Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium leading-none text-muted-foreground">System Metadata</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div className="space-y-1">
                                    <span className="font-semibold">User ID:</span>
                                    <p className="font-mono text-xs">{profile.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Joined:</span>
                                    <p>{new Date(profile.created_at).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Last Updated:</span>
                                    <p>{new Date(profile.updated_at).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold">Verification Status:</span>
                                    <p className="capitalize">{profile.verification_status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
