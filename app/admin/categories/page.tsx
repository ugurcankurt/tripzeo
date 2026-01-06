import { requireAdmin } from "@/lib/auth/guards"
import { createClient } from "@/lib/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CategoryDialog } from "@/modules/categories/components/category-dialog"
import { Badge } from "@/components/ui/badge"
import { CategoryActions } from "@/modules/categories/components/category-actions"
import { AdminPageHeader } from "@/components/admin/page-header"

export default async function CategoriesPage() {
    const supabase = await createClient()

    // Auth Check
    await requireAdmin()

    // Fetch Categories
    const { data } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

    const categories = data || []

    return (
        <div className="space-y-6">
            <AdminPageHeader heading="Categories" text="Manage experience categories.">
                <CategoryDialog mode="create" />
            </AdminPageHeader>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!categories || categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                    <TableCell>
                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                        <CategoryDialog mode="edit" category={category} />
                                        <CategoryActions id={category.id} isActive={category.is_active || false} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
