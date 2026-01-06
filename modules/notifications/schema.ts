import { z } from "zod"

export const createNotificationSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    link: z.string().optional(),
    type: z.enum(['info', 'success', 'warning', 'error']).optional().default('info'), // Future proofing
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
