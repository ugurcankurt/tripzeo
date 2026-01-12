'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent')
        if (consent === null) {
            setShowBanner(true)
        }
    }, [])

    const updateConsent = (granted: boolean) => {
        const newState = granted ? 'granted' : 'denied'

        // Save to local storage
        localStorage.setItem('cookie_consent', newState)

        // Update Google Consent Mode
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': newState,
                'ad_storage': newState,
                'ad_user_data': newState,
                'ad_personalization': newState
            })
        }

        setShowBanner(false)
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4 shadow-lg animate-in slide-in-from-bottom duration-300">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                    <p>
                        We use cookies to improve your experience and analyze site traffic.
                        By clicking "Accept", you agree to our use of cookies as described in our{' '}
                        <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => updateConsent(false)}>
                        Reject All
                    </Button>
                    <Button size="sm" onClick={() => updateConsent(true)}>
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    )
}
