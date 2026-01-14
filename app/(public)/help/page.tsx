import { HelpContentWrapper } from "@/components/help/help-content-wrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Help Center | Tripzeo",
    description: "Get help with your bookings, account, or hosting on Tripzeo. Find answers to frequently asked questions.",
    alternates: {
        canonical: "/help",
    },
    openGraph: {
        title: "Help Center | Tripzeo",
        description: "Get help with your bookings, account, or hosting on Tripzeo. Find answers to frequently asked questions.",
        url: "https://tripzeo.com/help",
        siteName: 'Tripzeo',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 675,
                alt: 'Help Center | Tripzeo'
            }
        ]
    }
}

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-background pb-12">
            <HelpContentWrapper />
        </main>
    )
}
