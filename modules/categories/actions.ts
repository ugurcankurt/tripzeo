/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils" // Assuming a utility exists or I will write a simple one inline if not

// Helper for slug generation if simple utility is preferred inline to avoid dependency hunting
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Delete category error:", error)
        return { error: "Failed to delete category" }
    }

    revalidatePath('/admin/categories')
    return { success: "Category deleted" }
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('categories')
        .update({
            is_active: isActive,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error("Toggle status error:", error)
        return { error: "Failed to update status" }
    }

    revalidatePath('/admin/categories')
    return { success: "Status updated" }
}

export async function updateCategory(id: string, prevState: any, formData: FormData) {
    const name = formData.get("name") as string

    if (!name) {
        return { error: "Name is required" }
    }

    const slug = generateSlug(name)
    const supabase = await createClient()

    const { error } = await supabase
        .from('categories')
        .update({
            name,
            slug,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error("Update category error:", error)
        if (error.code === '23505') { // Unique violation
            return { error: "A category with this name already exists." }
        }
        return { error: "Failed to update category" }
    }

    revalidatePath('/admin/categories')
    return { success: "Category updated successfully" }
}

export async function createCategory(prevState: any, formData: FormData) {
    const name = formData.get("name") as string

    if (!name) {
        return { error: "Name is required" }
    }

    const slug = generateSlug(name)
    const supabase = await createClient()

    const { error } = await supabase
        .from('categories')
        .insert({
            name,
            slug,
            is_active: true
        })

    if (error) {
        console.error("Create category error:", error)
        if (error.code === '23505') {
            return { error: "A category with this name already exists." }
        }
        return { error: "Failed to create category" }
    }

    revalidatePath('/admin/categories')
    return { success: "Category created successfully" }
}
