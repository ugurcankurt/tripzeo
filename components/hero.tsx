'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"


interface HeroProps {
    categories: {
        name: string
        icon: string | null
        slug: string
    }[]
    userAvatars?: string[]
}

export function Hero({ categories = [], userAvatars = [] }: HeroProps) {

    return (
        <div className="relative w-full h-[60vh] min-h-[450px] lg:h-[85vh] lg:min-h-[600px] flex items-start justify-center overflow-hidden bg-black text-white rounded-b-[2.5rem]">
            {/* 1. Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/tripzeo_hero.webp"
                    alt="Hero Background"
                    fill
                    className="object-cover opacity-90 animate-slow-zoom"
                    style={{ animationDuration: '40s' }}
                    priority
                />
                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </div>

            {/* 3. Main Content Container */}
            <div className="relative z-10 container mx-auto px-6 lg:px-24 h-full flex flex-col justify-end items-start text-left pb-16 lg:pb-24">

                {/* Headline */}
                <div className="space-y-6 max-w-4xl animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg leading-[1.1]">
                        Unforgettable experiences, <br className="hidden sm:block" />
                        curated for you.
                    </h1>
                    <p className="text-lg sm:text-lg text-white/90 font-medium drop-shadow max-w-2xl">
                        Discover and book unique activities, tours and services led by local experts.
                    </p>
                </div>

                {/* CTA Button */}
                <div className="w-full flex justify-start pt-6">
                    <Button size="lg" className="rounded-full h-14 pl-8 pr-10 text-lg bg-primary text-white hover:bg-chart-2 gap-3 group transition-all duration-300 w-auto" asChild>
                        <Link href="/search">
                            <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center group-hover:bg-white transition-colors">
                                <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            Explore Experiences
                        </Link>
                    </Button>
                </div>



            </div>
        </div>
    )
}
