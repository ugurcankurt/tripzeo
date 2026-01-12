import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export async function SiteFooter() {
    const supabase = await createClient()

    // Fetch 3 active categories for the footer
    const { data: categories } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('is_active', true)
        .limit(3)
        .order('name')

    return (
        <footer className="bg-muted/30 border-t items-center mt-auto">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-2xl tracking-tighter text-primary">
                            <div className="relative w-8 h-8">
                                <Image
                                    src="/tripzeo.svg"
                                    alt="Tripzeo Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            tripzeo
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Discover unique local experiences, tours, and activities hosted by experts around the world.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Navigation (Accordion) */}
                    <div className="md:hidden col-span-1 mt-6">
                        <Accordion type="single" collapsible className="w-full border-none shadow-none rounded-none">
                            <AccordionItem value="discover" className="border-b-0">
                                <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">Discover</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li>
                                            <Link href="/search" className="hover:text-primary transition-colors">
                                                All Experiences
                                            </Link>
                                        </li>
                                        {categories?.map((category) => (
                                            <li key={`mobile-${category.slug}`}>
                                                <Link
                                                    href={`/category/${category.slug}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="hosting" className="border-b-0">
                                <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">Hosting</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li>
                                            <Link href="/become-a-host" className="hover:text-primary transition-colors flex items-center gap-2">
                                                Become a Host
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/vendor" className="hover:text-primary transition-colors">
                                                Host Dashboard
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/become-a-host#how-it-works" className="hover:text-primary transition-colors">
                                                How it works
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/register?role=host" className="hover:text-primary transition-colors">
                                                Sign up as Host
                                            </Link>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="support" className="border-b-0">
                                <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">Support</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li>
                                            <Link href="/help" className="hover:text-primary transition-colors">
                                                Help Center
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/privacy" className="hover:text-primary transition-colors">
                                                Privacy Policy
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/terms" className="hover:text-primary transition-colors">
                                                Terms of Service
                                            </Link>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Desktop Columns */}
                    <div className="hidden md:block">
                        <p className="font-semibold text-lg mb-4">Discover</p>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/search" className="hover:text-primary transition-colors">
                                    All Experiences
                                </Link>
                            </li>
                            {categories?.map((category) => (
                                <li key={category.slug}>
                                    <Link
                                        href={`/category/${category.slug}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Hosting Column */}
                    <div className="hidden md:block">
                        <p className="font-semibold text-lg mb-4">Hosting</p>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/become-a-host" className="hover:text-primary transition-colors flex items-center gap-2">
                                    Become a Host
                                </Link>
                            </li>
                            <li>
                                <Link href="/vendor" className="hover:text-primary transition-colors">
                                    Host Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/become-a-host#how-it-works" className="hover:text-primary transition-colors">
                                    How it works
                                </Link>
                            </li>
                            <li>
                                <Link href="/register?role=host" className="hover:text-primary transition-colors">
                                    Sign up as Host
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div className="hidden md:block">
                        <p className="font-semibold text-lg mb-4">Support</p>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/help" className="hover:text-primary transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>

                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Tripzeo. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
