'use client'

import { useEffect, useRef } from "react"

interface CheckoutFormProps {
    htmlContent?: string
}

export function CheckoutForm({ htmlContent }: CheckoutFormProps) {

    const scriptRef = useRef<HTMLScriptElement | null>(null)

    useEffect(() => {
        if (!htmlContent) return

        // console.log("Iyzipay: Received content length:", htmlContent.length)

        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')

        // 1. Inject Styles
        const styles = doc.querySelectorAll('style')
        styles.forEach(style => {
            const styleElement = document.createElement('style')
            styleElement.textContent = style.textContent
            document.head.appendChild(styleElement)
        })

        // 2. Inject Scripts
        const scripts = doc.querySelectorAll('script')
        const injectedScripts: HTMLScriptElement[] = []

        scripts.forEach(script => {
            const scriptElement = document.createElement('script')
            if (script.src) {
                scriptElement.src = script.src
            } else {
                scriptElement.textContent = script.textContent
            }
            document.body.appendChild(scriptElement)
            injectedScripts.push(scriptElement)
        })

        // Force resize for iframe
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
        }, 500)

        // Cleanup
        return () => {
            injectedScripts.forEach(s => {
                if (document.body.contains(s)) {
                    document.body.removeChild(s)
                }
            })
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
