import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "Is it free to list?",
        answer: "Yes, it's completely free to create a listing on Tripzeo. We only charge a small commission when you successfully receive a booking."
    },
    {
        question: "How do I get paid?",
        answer: "We send payouts directly to your bank account or preferred payment method. Payouts are typically processed 24 hours after the experience is completed."
    },
    {
        question: "Do I need insurance?",
        answer: "While we recommend all hosts have liability insurance, Tripzeo provides basic coverage for eligible claims. Please review our Host Guarantee for more details."
    },
    {
        question: "Can I set my own schedule?",
        answer: "Absolutely. You have full control over your calendar. You can host daily, weekly, or just occasionally—it's entirely up to you."
    },
    {
        question: "What if a guest cancels?",
        answer: "You choose your cancellation policy. If a guest cancels outside of the allowed window, you will still receive your payout according to the policy you selected."
    }
]

export function HostFAQ() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about hosting.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-b-muted-foreground/20">
                            <AccordionTrigger className="text-left text-lg font-medium py-6 hover:no-underline hover:text-primary transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
