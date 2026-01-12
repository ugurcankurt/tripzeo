import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export async function HostShowcase() {
    const supabase = await createClient()

    // Fetch active categories
    const { data: categories } = await supabase
        .from('categories')
        .select('name, slug, icon')
        .eq('is_active', true)
        .order('name')
        .limit(4) // Show top 4 categories

    if (!categories || categories.length === 0) {
        return null
    }

    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div className="max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Host what you love</h2>
                        <p className="text-lg text-muted-foreground">
                            From food tours to photography classes, there's a category for every passion.
                        </p>
                    </div>
                    <Link href="/register?role=host" className="text-primary font-semibold hover:underline flex items-center gap-1">
                        View all possibilities →
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
                    {categories.map((cat) => (
                        <div key={cat.slug} className="group h-full pt-8">
                            <div className="relative h-full">
                                <Card className="h-full group hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 ring-1 ring-foreground/10 bg-card hover:ring-primary/50 flex flex-col items-start justify-end min-h-[200px] overflow-visible relative rounded-2xl border-none shadow-sm">

                                    {/* Character Image - Pop-out Effect */}
                                    {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/')) ? (
                                        <div className="absolute -top-16 -right-2 w-32 h-40 md:-top-20 md:w-40 md:h-48 z-20 pointer-events-none">
                                            <Image
                                                src={cat.icon}
                                                alt={cat.name}
                                                fill
                                                className="object-contain object-bottom group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 drop-shadow-2xl"
                                                sizes="(max-width: 768px) 128px, 160px"
                                            />
                                        </div>
                                    ) : null}

                                    {/* Text Content */}
                                    <div className="p-6 w-full relative z-10">
                                        <h3 className="font-bold text-2xl text-card-foreground mb-2">
                                            {cat.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create experiences in {cat.name.toLowerCase()}
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
