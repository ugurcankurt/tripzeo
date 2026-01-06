'use client'

import { useEffect, useRef } from "react"

interface CheckoutFormProps {
    htmlContent?: string
}

export function CheckoutForm({ htmlContent }: CheckoutFormProps) {

    useEffect(() => {
        if (!htmlContent) return

        // 1. Render the HTML (which includes the div and script tags)
        // However, React won't execute the script. We need to manually handle it.

        // Simple regex to find the script content
        const scriptMatch = htmlContent.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)
        const scriptContent = scriptMatch ? scriptMatch[1] : null

        // Also extract any external script src if present (Iyzipay usually has one?)
        // Usually Iyzipay content is embedded JS.

        if (scriptContent) {
            const script = document.createElement("script")
            script.type = "text/javascript"
            script.innerHTML = scriptContent
            // Remove existing scripts to avoid duplicates if any?
            // For now just append.
            document.body.appendChild(script)

            return () => {
                document.body.removeChild(script)
                // Cleanup iyzipay form if needed?
            }
        }
    }, [htmlContent])

    if (!htmlContent) {
        return <div>Loading payment form...</div>
    }

    // Clean htmlContent to remove script tags for strict rendering, 
    // or just render it and let React ignore the script (it renders it but doesn't run it).
    // The important part is the <div id="iyzipay-checkout-form"> that the script targets.

    return (
        <div className="w-full min-h-[400px]">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <div id="iyzipay-checkout-form" className="responsive"></div>
        </div>
    )
}
