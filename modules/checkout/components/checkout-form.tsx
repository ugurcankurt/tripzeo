'use client'

import { useEffect, useRef } from "react"

interface CheckoutFormProps {
    htmlContent?: string
}

export function CheckoutForm({ htmlContent }: CheckoutFormProps) {

    const scriptRef = useRef<HTMLScriptElement | null>(null)

    useEffect(() => {
        if (!htmlContent) {
            console.warn("Iyzipay: No HTML content received")
            return
        }

        // Debug: Log the received content
        console.log("Iyzipay: Received HTML Content Length:", htmlContent.length)
        // console.log("Iyzipay: HTML Content:", htmlContent) // Uncomment if needed deeply

        // 1. Find the script content - RELAXED REGEX
        // Matches <script>, <script type="...">, etc.
        const scriptMatch = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
        const scriptContent = scriptMatch ? scriptMatch[1] : null

        if (!scriptContent) {
            console.error("Iyzipay: No script block found in response!", htmlContent)
            return
        }

        console.log("Iyzipay: Script extracted successfully")

        if (scriptContent) {
            // Check if script is already running to avoid duplication
            if (scriptRef.current) return

            const script = document.createElement("script")
            script.type = "text/javascript"
            // Wrap in try-catch to prevent crashing if Iyzipay fails
            script.innerHTML = `try { ${scriptContent} } catch(e) { console.error('Iyzipay Script Error:', e) }`

            document.body.appendChild(script)
            scriptRef.current = script

            // Force a resize event after a delay to ensure responsive iframe adjusts
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, 500)
        }

        return () => {
            if (scriptRef.current) {
                document.body.removeChild(scriptRef.current)
                scriptRef.current = null
            }
            // Cleanup the iframe div to prevent duplicates on re-renders
            const formDiv = document.getElementById("iyzipay-checkout-form")
            if (formDiv) formDiv.innerHTML = ""
        }
    }, [htmlContent])

    if (!htmlContent) {
        return <div className="p-4 text-center text-muted-foreground">Loading secure payment form...</div>
    }

    return (
        <div className="w-full min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            {/* 
                We do NOT render htmlContent directly via dangerouslySetInnerHTML.
                Iyzipay response includes the <div id="iyzipay-checkout-form"> AND the <script>.
                Rendering it would create a duplicate ID conflict with the dead HTML and our manual script.
                Instead, we provide the clean target container below and let our manual script fill it.
            */}
            <div id="iyzipay-checkout-form" className="responsive w-full"></div>
        </div>
    )
}
