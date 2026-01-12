'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface HelpHeroProps {
    searchValue?: string
    onSearchChange?: (value: string) => void
}

export function HelpHero({ searchValue, onSearchChange }: HelpHeroProps) {
    return (
        <div className="relative w-full bg-primary text-white overflow-hidden">
            {/* Background Pattern & Gradient */}
            <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary pointer-events-none"></div>

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 text-center max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                    How can we help you?
                </h1>
                <p className="text-primary-foreground/80 text-lg mb-8">
                    Find answers to your questions about booking, hosting, and traveling with Tripzeo.
                </p>

                <div className="relative max-w-2xl mx-auto shadow-2xl rounded-full group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <Input
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder="Search for answers (e.g. 'refund policy', 'payouts')"
                        className="h-14 pl-12 rounded-full text-lg border-0 shadow-inner bg-white/95 backdrop-blur text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-white/50"
                    />
                </div>

                <p className="mt-6 text-sm text-primary-foreground/70">
                    Common searches: <span className="hover:text-white cursor-pointer underline decoration-dotted transition-colors">cancellation</span>, <span className="hover:text-white cursor-pointer underline decoration-dotted transition-colors">payments</span>
                </p>
            </div>
        </div>
    )
}
