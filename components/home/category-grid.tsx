import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
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
        .select('name, slug')
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
                    <CarouselItem key={cat.slug} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                        <div className="p-1 h-full">
                            <Link
                                href={`/category/${encodeURIComponent(cat.slug)}`}
                                className="block group h-full"
                            >
                                <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-primary/50 flex items-center justify-center min-h-[80px]">
                                    <CardContent className="p-4 flex items-center justify-center h-full w-full">
                                        <span className="font-medium text-center group-hover:text-primary transition-colors select-none">
                                            {cat.name}
                                        </span>
                                    </CardContent>
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
