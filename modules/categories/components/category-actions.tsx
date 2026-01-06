'use client'

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteCategory, toggleCategoryStatus } from "@/modules/categories/actions"
import { toast } from "sonner"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
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

export function CategoryActions({ id, isActive }: { id: string, isActive: boolean }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isToggling, setIsToggling] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteCategory(id)
            if (result.error) toast.error(result.error)
            else toast.success(result.success)
        } catch {
            toast.error("Failed to delete")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggle = async (checked: boolean) => {
        setIsToggling(true)
        try {
            const result = await toggleCategoryStatus(id, checked)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(checked ? "Category activated" : "Category deactivated")
            }
        } catch {
            toast.error("Failed to update status")
        } finally {
            setIsToggling(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Switch
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isToggling}
                    aria-label="Toggle category status"
                />
                {isToggling && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
