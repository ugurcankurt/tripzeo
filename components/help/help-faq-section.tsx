'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HELP_ITEMS, HelpItem } from "@/lib/data/help-questions"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface HelpFAQSectionProps {
    fixedItems?: HelpItem[]
    className?: string
}

export function HelpFAQSection({ fixedItems, className }: HelpFAQSectionProps) {

    // If fixedItems are provided (Search Mode), just show them in a list
    if (fixedItems) {
        return (
            <section className={cn("pb-16", className)}>
                <div className="container mx-auto px-0 bg-background rounded-lg border">
                    <Accordion type="single" collapsible className="w-full px-4">
                        {fixedItems.map((item) => (
                            <div key={item.id} className="border-b-muted/50 last:border-0 border-b py-4">
                                <Link href={`/help/article/${item.slug}`} className="text-left font-medium hover:text-primary block text-lg mb-2">
                                    {item.question}
                                </Link>
                                <p className="text-muted-foreground text-sm line-clamp-2">
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </Accordion>
                </div>
            </section>
        )
    }

    // Default Mode with Tabs
    const guestItems = HELP_ITEMS.filter(i => i.category === 'guest')
    const hostItems = HELP_ITEMS.filter(i => i.category === 'host')

    return (
        <section className={cn("py-16 bg-muted/30", className)}>
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

                <Tabs defaultValue="guest" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="guest">For Guests</TabsTrigger>
                        <TabsTrigger value="host">For Hosts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="guest">
                        <div className="bg-background rounded-lg border">
                            <Accordion type="single" collapsible className="w-full px-4">
                                {guestItems.map((item) => (
                                    <AccordionItem key={item.id} value={item.id} className="border-b-muted/50 last:border-0">
                                        <AccordionTrigger className="text-left font-medium hover:text-primary">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </TabsContent>

                    <TabsContent value="host">
                        <div className="bg-background rounded-lg border">
                            <Accordion type="single" collapsible className="w-full px-4">
                                {hostItems.map((item) => (
                                    <AccordionItem key={item.id} value={item.id} className="border-b-muted/50 last:border-0">
                                        <AccordionTrigger className="text-left font-medium hover:text-primary">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    )
}
