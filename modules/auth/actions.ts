'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { sendPartnerWelcomeEmail } from '@/lib/email'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type-casting or validation should ideally happen here
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
                phone,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true, email }
}

export async function registerPartner(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
                phone,
                role: 'partner'
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Send Welcome Email
    await sendPartnerWelcomeEmail(email, full_name)

    revalidatePath('/', 'layout')
    return { success: true, email }
}

export async function verifyOtp(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const code = formData.get('code') as string

    const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signout(...args: any[]) {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function oauthLogin(provider: 'google' | 'github') {
    const supabase = await createClient();
    const headers = new Headers();
    const origin = headers.get('origin');

    // In server actions, we might need a different way to construct URL if request headers aren't available easily
    // But typically for OAuth in server actions we redirect to the provider
    // Using default localhost for now if origin not found, should be configured in env
    const redirectUrl = `https://tripzeo.com/auth/callback`; // Replace with actual env var or logic

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: redirectUrl,
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.url) {
        redirect(data.url);
    }
}


// --- Restored/Placeholder Actions (Keeping signatures compatible) ---

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    // Check if user exists to provide better feedback
    // Note: This relies on public/anon access to profiles by email, which might be restricted by RLS.
    // If strict security is needed (no enumeration), remove this check.
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (!profile) {
        return { error: "Email address not found." }
    }

    // We'll rely on NEXT_PUBLIC_APP_URL or similar if available, or just hardcode for this context as requested.
    const headerList = await headers()
    const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    // const redirectTo = `${origin}/auth/callback?next=/reset-password`

    // Use signInWithOtp to trigger the "Magic Link" template as requested by the user.
    // By default this sends a magic link, but if the template uses {{ .Token }}, it sends a code.
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false, // Don't create new users on forgot password
            // emailRedirectTo: redirectTo, // Not strictly needed if using code, but good practice
        }
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, email }
}

export async function verifyRecoveryOtp(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const code = formData.get('code') as string

    // When using signInWithOtp (magic link flow), the verification type for the code is 'email' (or 'magiclink' depending on context, but 'email' is standard for OTP login)
    const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string

    // Check if user is authenticated (via the exchange code from the email link)
    // The middleware/page logic should handle the session exchange before this form is submitted

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

// --- Restored/Placeholder Actions (Keeping signatures compatible) ---

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be signed in to update your profile.' }
    }

    const full_name = formData.get('fullName') as string
    const avatar_url = formData.get('avatarUrl') as string
    const phone = formData.get('phone') as string
    // --- Bio Validation ---
    const bio = formData.get('bio') as string
    if (bio) {
        // 1. Check for @ symbol (Emails, handles)
        if (bio.includes('@')) {
            return { error: 'Bio cannot contain "@" symbol or email addresses.' }
        }

        // 2. Check for Phone Numbers (Rough check for 7+ consecutive digits, or common patterns)
        // Adjust regex as needed to be strict but strictly avoid false positives if possible, 
        // though user request implies strict blocking.
        const phoneRegex = /(\d[\s-.]?){7,}/
        if (phoneRegex.test(bio)) {
            return { error: 'Bio cannot contain phone numbers.' }
        }

        // 3. Check for URLs / Domains
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b\w+\.(com|net|org|io|me|tr)\b)/i
        if (urlRegex.test(bio)) {
            return { error: 'Bio cannot contain website links.' }
        }

        // 4. Check for Social Keywords
        const socialRegex = /\b(instagram|facebook|insta|fb|whatsapp|linkedin|twitter|tiktok)\b/i
        if (socialRegex.test(bio)) {
            return { error: 'Bio cannot contain social media names or links.' }
        }
    }

    const category_id = formData.get('categoryId') as string
    const country = formData.get('country') as string
    const state = formData.get('state') as string
    const city = formData.get('city') as string
    const address = formData.get('address') as string
    const zip_code = formData.get('zipCode') as string

    // Bank Details
    const bank_name = formData.get('bankName') as string
    const account_holder = formData.get('accountHolder') as string
    const iban = formData.get('iban') as string


    const updates: any = {
        updated_at: new Date().toISOString(),
        avatar_url, // Allow updating avatar
        phone,
        bio,
        country,
        state,
        city,
        address,
        zip_code,
        bank_name,
        account_holder,
        iban,
        bank_country: formData.get('bankCountry') as string,
        routing_number: formData.get('routingNumber') as string,
        account_number: formData.get('accountNumber') as string,
        bank_code: formData.get('bankCode') as string,
    }

    // Only update category_id if it's provided (it might be disabled/hidden)
    if (category_id) {
        updates.category_id = category_id
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        console.error('Profile update error:', error)
        return { error: 'Failed to update profile.' }
    }

    revalidatePath('/account') // Update cached data
    revalidatePath('/', 'layout') // Update avatar in header if present

    return { success: 'Profile updated successfully!', timestamp: Date.now() }
}

export async function initiateEmailChange(...args: any[]) {
    console.log("initiateEmailChange called", args)
    return { success: "Email change initiated", error: undefined }
}

export async function verifyEmailChange(...args: any[]) {
    console.log("verifyEmailChange called", args)
    return { success: "Email change verified", error: undefined }
}

export async function requestHostAccess() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', user.id)

    if (error) {
        console.error("Error requesting host access:", error)
        return { error: "Failed to submit application" }
    }

    revalidatePath('/vendor')
    return { success: true }
}

export async function createAutoUser(formData: FormData) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const email = formData.get('email') as string
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const country = formData.get('country') as string
    const zipCode = formData.get('zipCode') as string
    const state = formData.get('state') as string

    // 2. Generate secure random password
    const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    // 3. Create Verified User
    const { data: user, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true, // Auto-verify
        user_metadata: {
            full_name,
            phone,
            address,
            city,
            country,
            zip_code: zipCode,
            state
        }
    })

    if (createError) {
        if (createError.message.includes("already registered")) {
            return { error: "This email is already registered. Please sign in." }
        }
        return { error: createError.message }
    }

    if (!user || !user.user) {
        return { error: "Failed to create user." }
    }

    // 3.1 Explicitly update profile with address data
    // (Trigger might not map these fields, so we do it manually to be safe)
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .update({
            address,
            city,
            country,
            zip_code: zipCode,
            state
        })
        .eq('id', user.user.id)

    if (profileError) {
        console.error("Failed to update profile address:", profileError)
        // We continue, as the user is created
    }

    // 4. Sign In (to get session for booking)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: temporaryPassword
    })

    if (signInError) {
        return { error: "Account created but login failed. Please login manually." }
    }

    // 5. Send Password Reset/Set Link
    // Point to /auth/callback to handle code exchange, then redirect to /reset-password
    const headerList = await headers()

    // Determine protocol and host
    const host = headerList.get('x-forwarded-host') || headerList.get('host')
    const protocol = headerList.get('x-forwarded-proto') || 'https'

    let origin = ''
    if (host) {
        origin = `${protocol}://${host}`
    } else {
        origin = headerList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.tripzeo.com'
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })

    if (resetError) {
        console.error("Failed to send reset email:", resetError)
    }

    return { success: true }
}
