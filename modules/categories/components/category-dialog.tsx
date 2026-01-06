'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tables } from "@/types/supabase"

import { updateCategory, createCategory } from "@/modules/categories/actions"
import { toast } from "sonner"
import { Plus, Pencil, Loader2 } from "lucide-react"

interface CategoryDialogProps {
    mode: 'create' | 'edit'
    category?: Tables<'categories'>
}

export function CategoryDialog({ mode, category }: CategoryDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState(category?.name || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append('name', name)

            let result
            if (mode === 'create') {
                result = await createCategory(null, formData)
            } else {
                if (!category) return
                result = await updateCategory(category.id, null, formData)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(result.success)
                setOpen(false)
                if (mode === 'create') setName('')
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'create' ? (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New Category' : 'Edit Category'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? "Create a new category for experiences. This will be visible to hosts immediately."
                            : "Update existing category name. Current slug: " + category?.slug}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Food Tours"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slug" className="text-right text-muted-foreground">
                                Slug Preview
                            </Label>
                            <Input
                                id="slug"
                                value={name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}
                                className="col-span-3 bg-muted text-muted-foreground"
                                readOnly
                                disabled
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
