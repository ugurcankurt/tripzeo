import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            console.error('Auth code exchange error:', error)
            // Redirect to error page with specific error code if needed
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed`)
        }
    } else {
        const error = searchParams.get('error')
        const error_description = searchParams.get('error_description')
        if (error) {
            console.error('Auth callback error:', error, error_description)
        }
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}&description=${error_description}`)
    }

    // Fallback if no code and no error
    return NextResponse.redirect(`${origin}/login`)
}
