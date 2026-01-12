'use client'

import { useState } from "react"
import { HelpHero } from "@/components/help/help-hero"
import { HelpCategories } from "@/components/help/help-categories"
import { HelpFAQSection } from "@/components/help/help-faq-section"
import { HELP_ITEMS, HelpItem } from "@/lib/data/help-questions"

export function HelpContentWrapper() {
    const [searchQuery, setSearchQuery] = useState("")

    // Filter items based on search query
    const filteredItems = HELP_ITEMS.filter(item => {
        const query = searchQuery.toLowerCase()
        return (
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query) ||
            item.keywords?.some(k => k.toLowerCase().includes(query))
        )
    })

    return (
        <>
            <HelpHero
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {searchQuery ? (
                // Search Results View
                <div className="container mx-auto px-4 py-12 min-h-[50vh]">
                    <h2 className="text-2xl font-bold mb-6">
                        {filteredItems.length} results for "{searchQuery}"
                    </h2>
                    {filteredItems.length > 0 ? (
                        <HelpFAQSection fixedItems={filteredItems} className="bg-background" />
                    ) : (
                        <div className="text-muted-foreground text-center py-12">
                            <p>No results found. Try adjusting your search terms.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-primary hover:underline mt-4"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Default View
                <>
                    <HelpCategories />
                    <HelpFAQSection />
                </>
            )}
        </>
    )
}
