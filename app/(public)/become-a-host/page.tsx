import { HostHero } from "@/components/host-landing/host-hero"
import { WhyHost } from "@/components/host-landing/why-host"
import { HostShowcase } from "@/components/host-landing/host-showcase"
import { HowItWorks } from "@/components/host-landing/how-it-works"
import { HostFAQ } from "@/components/host-landing/host-faq"
import { HostCTA } from "@/components/host-landing/host-cta"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Become a Host | Tripzeo",
    description: "Share your passion, host experiences, and earn money on Tripzeo. Join our global community of hosts today.",
    alternates: {
        canonical: "/become-a-host",
    },
    openGraph: {
        title: "Become a Host | Tripzeo",
        description: "Share your passion, host experiences, and earn money on Tripzeo. Join our global community of hosts today.",
        url: "https://tripzeo.com/become-a-host",
        siteName: 'Tripzeo',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 675,
                alt: 'Become a Host | Tripzeo'
            }
        ]
    }
}

export default function BecomeHostPage() {
    return (
        <main className="min-h-screen bg-background pb-0">
            <HostHero />
            <WhyHost />
            <HostShowcase />
            <HowItWorks />
            <HostFAQ />
            <HostCTA />
        </main>
    )
}
