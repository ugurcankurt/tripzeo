import { Suspense } from "react"
import { SearchResults } from "@/components/public/search-results"
import { SearchResultsSkeleton } from "@/components/skeletons/search-results-skeleton"

interface SearchPageProps {
    searchParams: Promise<{
        q?: string
        category?: string
        location?: string
    }>
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
    const params = await searchParams
    const q = params.q
    const category = params.category

    let title = "Search Experiences"
    if (q) title = `${q} - Search Results`
    if (category) title = `${category} Experiences`

    return {
        title,
        description: `Find the best ${category || "local"} experiences on Tripzeo.`,
        robots: {
            index: true,
            follow: true,
        }
    }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams
    const q = params.q
    const category = params.category

    return (
        <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults q={q} category={category} />
        </Suspense>
    )
}
