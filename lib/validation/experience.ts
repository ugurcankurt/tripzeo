
import { z } from "zod"

export const experienceSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(20, "Description must be at least 20 characters long"),
    location_country: z.string().min(1, "Country is required"),
    location_city: z.string().min(1, "City is required"),
    location_address: z.string().min(5, "Address must be at least 5 characters long"),
    location_state: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    // Note: currency is usually fixed or strictly controlled, keeping basic string check for now or default
    currency: z.string().default("USD"),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
    duration_minutes: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    images: z.array(z.string()).min(3, "At least 3 images are required"),
})

export type ExperienceFormValues = z.infer<typeof experienceSchema>
