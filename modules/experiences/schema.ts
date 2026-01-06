import { z } from "zod"

export const experienceSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    currency: z.string(),
    duration_minutes: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
    location_city: z.string().min(2, "City is required"),
    location_country: z.string().min(2, "Country is required"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),

    start_time: z.string().optional(),
    end_time: z.string().optional(),
    location_address: z.string().optional(),
    location_state: z.string().optional(),
    is_cancellable: z.boolean(),
    images: z.array(z.union([z.string(), z.instanceof(File)])).min(5, "At least 5 images are required to showcase your experience"),
    is_active: z.boolean(),
})

export type ExperienceFormValues = z.infer<typeof experienceSchema>
