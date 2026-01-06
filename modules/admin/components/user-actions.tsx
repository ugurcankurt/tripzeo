'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
    MoreHorizontal,
    Trash2,
    UserCog,
    Eye,
    Shield,
    User,
    Store,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { updateUserRole, deleteUser } from "@/modules/admin/actions"
import { UserDetailsDialog } from "./user-details-dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Tables } from "@/types/supabase"

interface AdminUserActionsProps {
    profile: Tables<'profiles'>
}

export function AdminUserActions({ profile }: AdminUserActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)

    const handleRoleUpdate = async (newRole: 'user' | 'host' | 'admin') => {
        if (newRole === profile.role) return

        setIsLoading(true)
        try {
            const result = await updateUserRole(profile.id, newRole)
            if (result.error) toast.error(result.error)
            else toast.success(result.success)
        } catch {
            toast.error("Failed to update role")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        setShowDeleteAlert(false)
        try {
            const result = await deleteUser(profile.id)
            if (result.error) toast.error(result.error)
            else toast.success(result.success)
        } catch {
            toast.error("Failed to delete user")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                        <span className="sr-only">Open menu</span>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={profile.role || undefined} onValueChange={(v) => handleRoleUpdate(v as 'user' | 'host' | 'admin')}>
                                <DropdownMenuRadioItem value="user">
                                    <User className="mr-2 h-4 w-4" /> User
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="host">
                                    <Store className="mr-2 h-4 w-4" /> Host
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="admin">
                                    <Shield className="mr-2 h-4 w-4" /> Admin
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setShowDeleteAlert(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <UserDetailsDialog
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                profile={profile}
            />

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
