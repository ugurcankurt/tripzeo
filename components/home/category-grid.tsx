import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

export async function CategoryGrid() {
    const supabase = await createClient()

    // Fetch active categories
    const { data: categories } = await supabase
        .from('categories')
        .select('name, slug, icon')
        .eq('is_active', true)
        .order('name')

    if (!categories || categories.length === 0) {
        return null
    }

    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
        >
            <CarouselContent className="-ml-2 md:-ml-4">
                {categories.map((cat) => (
                    <CarouselItem key={cat.slug} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5 pt-12">
                        <div className="p-1 h-full">
                            <Link
                                href={`/category/${encodeURIComponent(cat.slug)}`}
                                className="block group h-full"
                            >
                                <Card className="h-full group hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 ring-1 ring-foreground/10 bg-card hover:ring-primary/50 flex flex-col items-start justify-end min-h-[160px] overflow-visible relative rounded-2xl">

                                    {/* Character Image - Top Right Pop-out */}
                                    {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/')) ? (
                                        <div className="absolute -top-10 -right-4 w-24 h-32 md:-top-12 md:-right-6 md:w-36 md:h-44 z-20 pointer-events-none">
                                            <Image
                                                src={cat.icon}
                                                alt={cat.name}
                                                fill
                                                className="object-contain object-bottom group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 drop-shadow-xl"
                                                sizes="(max-width: 768px) 128px, 160px"
                                            />
                                        </div>
                                    ) : null}

                                    {/* Text Content - Bottom Aligned */}
                                    <div className="p-5 w-full relative z-10 flex flex-col gap-1">
                                        <div className="font-bold text-lg text-card-foreground leading-none">
                                            {cat.name}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
        </Carousel>
    )
}
