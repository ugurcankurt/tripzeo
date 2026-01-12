'use client'

import { Wallet, Calendar, Globe, Shield } from "lucide-react"

const features = [
    {
        icon: Wallet,
        title: "Earn Extra Income",
        description: "Set your own prices and keep up to 88% of your earnings. Get paid directly to your bank account."
    },
    {
        icon: Calendar,
        title: "Total Flexibility",
        description: "You're in control. Choose your own schedule, prices, and requirements for guests."
    },
    {
        icon: Globe,
        title: "Global Audience",
        description: "Connect with millions of travelers searching for unique local experiences on Tripzeo."
    },
    {
        icon: Shield,
        title: "Secure & Safe",
        description: "We handle all payments securely and provide 24/7 support for you and your guests."
    }
]

export function WhyHost() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why host on Tripzeo?</h2>
                    <p className="text-lg text-muted-foreground">
                        We provide the tools, safety, and reach you need to turn your expertise into a thriving business.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
