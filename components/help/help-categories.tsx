import { HELP_CATEGORIES } from "@/lib/data/help-questions"
import Link from "next/link"

export function HelpCategories() {
    return (
        <section className="py-16 container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Browse by Topic</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {HELP_CATEGORIES.map((cat) => (
                    <Link key={cat.slug} href={`/help/category/${cat.slug}`} className="flex gap-4 p-6 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer group hover:border-primary/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <cat.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{cat.title}</h3>
                            <p className="text-sm text-muted-foreground">{cat.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
