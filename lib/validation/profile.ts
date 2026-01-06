import { Database } from "@/types/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export const REQUIRED_HOST_FIELDS = [
    'full_name',
    'bio',
    'phone',
    'iban',
    'bank_name',
    'account_holder'
] as const

type RequiredHostField = typeof REQUIRED_HOST_FIELDS[number]

/**
 * Validates if a host profile has all required fields filled.
 * @param profile - User profile object
 * @returns Object with validation results
 */
export function validateHostProfile(profile: Partial<Profile> | null) {
    if (!profile) {
        return {
            isComplete: false,
            missingFields: [...REQUIRED_HOST_FIELDS]
        }
    }

    const missingFields = REQUIRED_HOST_FIELDS.filter(
        field => !profile[field as keyof Profile]
    )

    return {
        isComplete: missingFields.length === 0,
        missingFields
    }
}

/**
 * Checks if profile is complete and throws error if not.
 * Use this in pages that require complete profile.
 * @param profile - User profile object
 * @throws Error with code 'INCOMPLETE_PROFILE' if validation fails
 */
export function requireCompleteProfile(profile: Partial<Profile> | null) {
    const { isComplete, missingFields } = validateHostProfile(profile)

    if (!isComplete) {
        const error = new Error('Profile is incomplete')
        error.name = 'INCOMPLETE_PROFILE'
            ; (error as any).missingFields = missingFields
        throw error
    }
}
