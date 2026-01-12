'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function HostHero() {
    return (
        <div className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black text-white rounded-b-[2.5rem]">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/tripzeo_auth_image.webp"
                    alt="Host Hero Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center gap-8">
                <div className="space-y-4 max-w-4xl animate-fade-in-up">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl leading-[1.1]">
                        Turn your passion <br />
                        <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
                            into profit.
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 font-medium drop-shadow max-w-2xl mx-auto leading-relaxed">
                        Host tours, activities, and experiences. Earn money doing what you love while connecting with travelers from around the globe.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
                    <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary text-white hover:bg-primary/90 gap-2 w-full sm:w-auto" asChild>
                        <Link href="/register?role=host">
                            Become a Host
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm w-full sm:w-auto" asChild>
                        <Link href="#how-it-works">
                            How it works
                        </Link>
                    </Button>
                </div>

                <div className="pt-8 flex items-center justify-center gap-6 text-sm sm:text-base text-white/80 font-medium">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Free to list</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Secure payments</span>
                    </div>
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Global reach</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
