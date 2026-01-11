/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from "@/lib/supabase/server"
import { experienceSchema } from "./schema"
import { revalidatePath } from "next/cache"

export async function createExperience(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Fetch user profile to get category_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('category_id, categories(name)')
        .eq('id', user.id)
        .single()

    if (!profile?.category_id) {
        return { error: "You must select a service category in your profile before creating experiences." }
    }

    const validatedFields = experienceSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors }
    }

    const { error } = await supabase
        .from('experiences')
        .insert({
            ...validatedFields.data,
            images: validatedFields.data.images as string[], // Cast to match DB type (files are uploaded by client)
            host_id: user.id,

            category: profile.categories?.name || 'Uncategorized', // Fallback for legacy text column if needed
            // New fields are automatically included via spread if they match schema/DB
            // ensure category_id is NOT inserted if it doesnt exist in DB, but plan says check if it exists.
            // Based on schema.sql read earlier, experiences table DOES NOT have category_id column.
            // It has 'category' text column.
            // So we use profile category name.
        })

    if (error) {
        console.error("Create experience error:", error)
        return { error: "Failed to create experience: " + error.message }
    }

    revalidatePath('/vendor')
    return { success: true }
}

export async function updateExperience(experienceId: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const validatedFields = experienceSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors }
    }

    const { error } = await supabase
        .from('experiences')
        .update({
            ...validatedFields.data,
            images: validatedFields.data.images as string[], // Cast to match DB type
            updated_at: new Date().toISOString()
        })
        .eq('id', experienceId)
        .eq('host_id', user.id)

    if (error) {
        console.error("Update experience error:", error)
        return { error: "Failed to update experience" }
    }

    revalidatePath('/vendor')
    revalidatePath(`/vendor/products/${experienceId}/edit`)
    return { success: true }
}

export async function deleteExperience(experienceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // 1. Fetch experience to get images
    const { data: experience } = await supabase
        .from('experiences')
        .select('images')
        .eq('id', experienceId)
        .eq('host_id', user.id)
        .single()

    if (!experience) {
        return { error: "Experience not found" }
    }

    // 2. Delete images from storage if any
    const images = experience.images as string[] | null
    if (images && images.length > 0) {
        // Initialize Admin Client for Storage Operations (Bypass RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceKey) {
            console.error("SUPABASE_SERVICE_ROLE_KEY is missing. Cannot delete images.");
        } else {
            const { createClient: createAdminClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            const filesToRemove: string[] = []

            for (const urlStr of images) {
                try {
                    // Parse URL to get file path
                    // Expected format: .../storage/v1/object/public/public_assets/experiences/filename.webp
                    // OR .../public_assets/experiences/filename.webp
                    const url = new URL(urlStr)

                    // Decode URL to handle spaces/special chars in filenames
                    const pathname = decodeURIComponent(url.pathname);

                    // We need to extract the path relative to the bucket 'public_assets'
                    const targetString = '/public_assets/';
                    const index = pathname.indexOf(targetString);

                    if (index !== -1) {
                        const filePath = pathname.substring(index + targetString.length);
                        if (filePath) {
                            filesToRemove.push(filePath)
                        }
                    }
                } catch (e) {
                    console.error("Error parsing image URL for deletion:", urlStr, e)
                }
            }

            if (filesToRemove.length > 0) {
                console.log("Deleting files from storage (Admin):", filesToRemove);
                const { error: storageError } = await supabaseAdmin.storage
                    .from('public_assets')
                    .remove(filesToRemove)

                if (storageError) {
                    console.error("Error removing images from storage:", storageError)
                } else {
                    console.log("Images deleted successfully.");
                }
            }
        }
    }

    // 3. Delete experience record
    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId)
        .eq('host_id', user.id)

    if (error) {
        console.error("Delete experience error:", error)
        return { error: "Failed to delete experience" }
    }

    revalidatePath('/vendor')
    return { success: true }
}

export async function toggleExperienceStatus(experienceId: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from('experiences')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', experienceId)
        .eq('host_id', user.id)

    if (error) {
        console.error("Toggle status error:", error)
        return { error: "Failed to update status" }
    }

    revalidatePath('/vendor')
    return { success: true }
}
