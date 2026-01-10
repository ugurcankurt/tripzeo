/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, MapPin } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const revalidate = 3600 // Revalidate every hour

interface CategoryPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
    const { slug } = await params

    // We can fetch the real name for better titles, or just capitalize slug
    const supabase = await createClient()
    const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', slug)
        .single()

    const title = category ? `${category.name} Experiences & Tours` : 'Experiences'

    return {
        title: title, // Suffix handled by layout template
        description: `Book top-rated ${title} on Tripzeo. Discover unique experiences, services, and local guides.`,
        alternates: {
            canonical: `https://tripzeo.com/category/${slug}`
        }
    }
}

// Programmatic SEO: Generate static paths for known categories
export async function generateStaticParams() {
    // GenerateStaticParams runs at build time and cannot use cookies()
    // We use a direct client here instead of the helper
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: categories } = await supabase
        .from('categories')
        .select('slug')
        .eq('is_active', true)

    if (!categories) return []

    return categories.map((category) => ({
        slug: category.slug,
    }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const supabase = await createClient()
    const { slug } = await params

    // 1. Get Category Details
    const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, slug, icon')
        .eq('slug', slug)
        .single()

    if (!categoryData) {
        notFound()
    }

    // 2. Fetch experiences matching the category Name
    // Note: experiences table stores 'category' as the Name string based on previous debug
    const { data: experiences } = await supabase
        .from('experiences')
        .select(`
            *,
            host:profiles(full_name, avatar_url)
        `)
        .eq('is_active', true)
        .eq('category', categoryData.name)
        .order('created_at', { ascending: false })

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://tripzeo.com"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": categoryData.name,
                        "item": `https://tripzeo.com/category/${slug}`
                    }
                ]
            },
            {
                "@type": "ItemList",
                "name": `${categoryData.name} Experiences`,
                "description": `Book top-rated ${categoryData.name} services and experiences`,
                "itemListElement": experiences?.map((exp: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "TouristTrip",
                        "name": exp.title,
                        "description": exp.description,
                        "url": `https://tripzeo.com/experience/${exp.id}`,
                        "provider": {
                            "@type": "Organization",
                            "name": "Tripzeo"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": exp.price,
                            "priceCurrency": exp.currency || "USD"
                        }
                    }
                })) || []
            }
        ]
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Visual Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{categoryData.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    {categoryData.name} Experiences
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Discover and book the best {categoryData.name.toLowerCase()} services.
                    Handpicked local experiences for unforgettable memories.
                </p>
            </div>

            {/* Schema.org Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {experiences && experiences.length > 0 ? (
                    experiences.map((exp: any) => (
                        <ExperienceCard key={exp.id} experience={exp} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-muted/30 rounded-xl border border-dashed">
                        <h3 className="text-2xl font-semibold mb-2">No experiences found in this category yet</h3>
                        <p className="text-muted-foreground">
                            We are working on adding more {categoryData.name.toLowerCase()} experiences. Please check back soon!
                        </p>
                    </div>
                )}
            </div>

            {/* SEO Content Section */}
            {experiences && experiences.length > 0 && (
                <div className="mt-24">
                    <Card className="bg-muted/40 border-none shadow-sm overflow-visible relative mt-20 rounded-3xl">
                        {/* Decorative background element - Removed MapPin, Added Category Image */}
                        {categoryData.icon && (categoryData.icon.startsWith('http') || categoryData.icon.startsWith('/')) ? (
                            <div className="absolute -top-12 -right-2 md:-top-24 md:right-12 w-40 h-40 md:w-80 md:h-80 z-20 pointer-events-none opacity-100">
                                <Image
                                    src={categoryData.icon}
                                    alt={categoryData.name}
                                    fill
                                    className="object-contain object-bottom drop-shadow-2xl"
                                    sizes="(max-width: 768px) 256px, 320px"
                                />
                            </div>
                        ) : null}

                        <CardContent className="p-8 md:p-12 relative z-10">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Curated Experience</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight text-foreground">
                                    Why Book <span className="text-primary">{categoryData.name}</span> with Tripzeo?
                                </h2>

                                <div className="prose prose-lg text-muted-foreground leading-relaxed">
                                    <p>
                                        Looking for the best <span className="font-semibold text-foreground">{categoryData.name.toLowerCase()}</span> experiences?
                                        Tripzeo curated a list of top-rated activities hosted by local experts.
                                    </p>
                                    <p className="mt-4">
                                        Whether you&apos;re visiting for the first time or a seasoned traveler, our {categoryData.name.toLowerCase()} experiences are designed to give you
                                        an authentic and memorable experience. Explore new skills, discover hidden spots, and make your trip unforgettable.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
