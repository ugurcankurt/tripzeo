import { z } from "zod";

// Helper regexes
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// A basic phone regex that catches common formats like +1-555-555-5555, (555) 555-5555, 555 555 5555
// Enhanced regex to catch various phone formats including:
// - International: +90 532 555 55 55
// - Standard: 0532 555 55 55
// - Continuous: 05325555555
// - Local: 532 555 5555
const PHONE_REGEX = /(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{2,4}[-. ]?\d{2,4}|\d{10,11}/;

// Catches http, https, www, and typical domain patterns like something.com
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/?[^\s]*)/;

export const messageSchema = z.object({
    content: z.string()
        .min(1, "Message cannot be empty")
        .max(1000, "Message is too long")
        .refine((val) => !EMAIL_REGEX.test(val), {
            message: "For your safety, sharing email addresses is not allowed."
        })
        .refine((val) => !PHONE_REGEX.test(val), {
            message: "For your safety, sharing phone numbers is not allowed."
        })
        .refine((val) => {
            // Find all URLs
            const matches = val.match(new RegExp(URL_REGEX, 'g'));
            if (!matches) return true;

            // Check if ALL matches are strictly tripzeo.com
            // If the user pasted "tripzeo.com/foo" it's allowed.
            // If "google.com", blocked.
            return matches.every(url => url.includes("tripzeo.com"));
        }, {
            message: "Sending links is not allowed. Please keep the conversation on Tripzeo."
        }),
    bookingId: z.string().uuid()
});

export type MessageFormValues = z.infer<typeof messageSchema>;
