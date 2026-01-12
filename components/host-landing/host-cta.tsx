import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HostCTA() {
    return (
        <section className="py-24 relative overflow-hidden bg-black text-white">
            <div className="absolute inset-0 z-0 opacity-40">
                <Image
                    src="/tripzeo_hero.webp" // Reusing hero for now, or could use another asset
                    alt="Footer Background"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                    Ready to start your journey?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                    Join thousands of hosts sharing their passion and earning income on Tripzeo today.
                </p>
                <Button size="lg" className="rounded-full h-14 px-10 text-lg bg-white text-primary hover:bg-white/90" asChild>
                    <Link href="/register?role=host">Get Started</Link>
                </Button>
            </div>
        </section>
    )
}
