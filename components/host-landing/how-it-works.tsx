import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
    {
        number: "01",
        title: "Create a listing",
        description: "Sign up for free, describe your experience, upload photos, and set your price.",
        image: "/onboarding-1.svg" // Placeholder or we can use icons
    },
    {
        number: "02",
        title: "Welcome guests",
        description: "Once your listing is live, qualified guests can book your experience immediately.",
        image: "/onboarding-2.svg"
    },
    {
        number: "03",
        title: "Get paid",
        description: "We'll send your earnings (minus our small service fee) directly to your bank account.",
        image: "/onboarding-3.svg"
    }
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-background border-t">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How tripzeo works for hosts</h2>
                    <p className="text-lg text-muted-foreground">
                        We've made it simple to start your own business. No upfront costs, no hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent z-0" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center text-3xl font-bold text-muted-foreground mb-8 group-hover:border-primary group-hover:text-primary transition-colors shadow-sm">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button size="lg" className="rounded-full px-8" asChild>
                        <Link href="/register?role=host">Start Hosting Now</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
