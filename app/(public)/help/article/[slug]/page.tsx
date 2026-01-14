import { HELP_ITEMS } from "@/lib/data/help-questions"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticleFeedback } from "@/components/help/article-feedback"

interface ArticlePageProps {
    params: Promise<{
        slug: string
    }>
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const resolvedParams = await params
    const item = HELP_ITEMS.find((i) => i.slug === resolvedParams.slug)

    if (!item) {
        return {
            title: "Article Not Found | Tripzeo Help",
        }
    }

    return {
        title: `${item.question} | Tripzeo Help`,
        description: item.answer.substring(0, 160),
        alternates: {
            canonical: `/help/article/${resolvedParams.slug}`,
        },
        openGraph: {
            title: `${item.question} | Tripzeo Help`,
            description: item.answer.substring(0, 160),
            url: `https://tripzeo.com/help/article/${resolvedParams.slug}`,
            siteName: 'Tripzeo',
        },
    }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const resolvedParams = await params
    const item = HELP_ITEMS.find((i) => i.slug === resolvedParams.slug)

    if (!item) {
        notFound()
    }

    // Find related articles in same category
    const relatedArticles = HELP_ITEMS
        .filter(i => i.category === item.category && i.id !== item.id)
        .slice(0, 3)

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Minimal Header */}
            <div className="bg-primary/5 border-b py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/help" className="hover:text-primary">Help Center</Link>
                        <span>/</span>
                        <Link href={`/help/category/${item.category}`} className="hover:text-primary capitalize">{item.category}</Link>
                        <span>/</span>
                        <span className="text-foreground truncate max-w-[200px]">{item.question}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
                        {item.question}
                    </h1>

                    <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
                        <div className="bg-card border rounded-xl p-8 shadow-sm">
                            <p className="lead text-xl text-muted-foreground leading-relaxed">
                                {item.answer}
                            </p>
                        </div>

                        {/* Contextual Note */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
                            <h4 className="text-blue-800 dark:text-blue-300 font-semibold m-0 mb-2 text-lg">Did you know?</h4>
                            <p className="text-blue-700 dark:text-blue-200 m-0 text-base">
                                Most answers can also be found in your Dashboard under specific booking details.
                            </p>
                        </div>
                    </article>

                    <ArticleFeedback />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Related Articles Box */}
                    <div className="bg-muted/30 rounded-xl p-6 border">
                        <h3 className="font-semibold text-lg mb-4">Related Articles</h3>
                        <ul className="space-y-4">
                            {relatedArticles.map(article => (
                                <li key={article.id}>
                                    <Link href={`/help/article/${article.slug}`} className="text-muted-foreground hover:text-primary block text-sm group">
                                        <span className="group-hover:translate-x-1 transition-transform inline-block">
                                            {article.question}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                            {relatedArticles.length === 0 && (
                                <li className="text-sm text-muted-foreground">No other articles in this category yet.</li>
                            )}
                        </ul>
                        <div className="mt-6 pt-4 border-t">
                            <Button variant="link" className="p-0 h-auto font-medium" asChild>
                                <Link href={`/help/category/${item.category}`}>
                                    View all {item.category} articles
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Contact Support Box */}
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                        <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Our support team is available 24/7 to assist you.
                        </p>
                        <Button className="w-full" asChild>
                            <Link href="mailto:info@tripzeo.com">Contact Support</Link>
                        </Button>
                    </div>
                </div>

            </div>
        </main>
    )
}
