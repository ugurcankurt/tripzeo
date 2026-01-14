import { HELP_ITEMS, HELP_CATEGORIES, HelpCategorySlug } from "@/lib/data/help-questions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface CategoryPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const resolvedParams = await params
    const category = HELP_CATEGORIES.find((c) => c.slug === resolvedParams.slug)

    if (!category) {
        return { title: "Category Not Found" }
    }

    return {
        title: `${category.title} Help | Tripzeo`,
        description: category.description,
        alternates: {
            canonical: `/help/category/${resolvedParams.slug}`,
        },
        openGraph: {
            title: `${category.title} Help | Tripzeo`,
            description: category.description,
            url: `https://tripzeo.com/help/category/${resolvedParams.slug}`,
            siteName: 'Tripzeo',
        },
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const resolvedParams = await params
    const category = HELP_CATEGORIES.find((c) => c.slug === resolvedParams.slug)

    if (!category) {
        notFound()
    }

    const articles = HELP_ITEMS.filter((i) => i.category === category.slug)

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="bg-muted/30 border-b py-12">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
                        <Link href="/help">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Help Center
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <category.icon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {category.title}
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        {category.description}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <Link key={article.id} href={`/help/article/${article.slug}`} className="group">
                            <Card className="h-full hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div>
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                            {article.question}
                                        </CardTitle>
                                        <CardDescription className="mt-2 line-clamp-2">
                                            {article.answer}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
