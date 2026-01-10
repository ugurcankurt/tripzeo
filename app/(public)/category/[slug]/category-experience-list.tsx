"use client"

import * as React from "react"
import { ExperienceCard } from "@/modules/experiences/components/experience-card"
import { MapPin } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Experience {
    id: string
    title: string
    price: number
    currency: string | null
    images: string[] | null
    location_city: string | null
    location_country: string | null
    rating: number | null
    review_count: number | null
    [key: string]: any
}

interface CategoryExperienceListProps {
    experiences: Experience[]
    categoryName: string
}

export function CategoryExperienceList({ experiences, categoryName }: CategoryExperienceListProps) {
    if (!experiences || experiences.length === 0) {
        return (
            <div className="py-20 text-center bg-muted/30 rounded-xl border border-dashed">
                <h3 className="text-2xl font-semibold mb-2">No experiences found in this category yet</h3>
                <p className="text-muted-foreground">
                    We are working on adding more {categoryName.toLowerCase()} experiences. Please check back soon!
                </p>
            </div>
        )
    }

    // Group experiences by city
    const groupedByCity = React.useMemo(() => {
        const grouped: Record<string, Experience[]> = {}
        experiences.forEach((exp) => {
            const city = exp.location_city || 'Other Locations'
            if (!grouped[city]) {
                grouped[city] = []
            }
            grouped[city].push(exp)
        })
        return grouped
    }, [experiences])

    // Get sorted city keys
    const cities = React.useMemo(() => {
        return Object.keys(groupedByCity).sort((a, b) => {
            if (a === 'Other Locations') return 1
            if (b === 'Other Locations') return -1
            return a.localeCompare(b, 'en')
        })
    }, [groupedByCity])

    const [selectedCity, setSelectedCity] = React.useState("all")

    const filteredCities = selectedCity === "all"
        ? cities
        : cities.filter(c => c === selectedCity)

    return (
        <div className="space-y-8">
            {/* Filter Header */}
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Filter by Location</span>
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-[180px] md:w-[240px] bg-background">
                        <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cities ({experiences.length})</SelectItem>
                        {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                                {city} ({groupedByCity[city].length})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Content Listing */}
            <div className="space-y-16">
                {filteredCities.map((city) => (
                    <section key={city} className="animate-in fade-in-50 duration-500">
                        <div className="flex items-center gap-2 mb-6">
                            {city !== 'Other Locations' && <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                            <h2 className="text-xl md:text-3xl font-bold tracking-tight">
                                {city}
                                <span className="text-muted-foreground font-medium text-base md:text-lg ml-2">
                                    ({groupedByCity[city].length})
                                </span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {groupedByCity[city].map((exp) => (
                                <ExperienceCard
                                    key={exp.id}
                                    className="w-full"
                                    experience={{
                                        ...exp,
                                        images: exp.images || [],
                                        rating: exp.rating || 0,
                                        currency: exp.currency || 'USD',
                                        location_city: exp.location_city || '',
                                        location_country: exp.location_country || '',
                                        review_count: exp.review_count || 0
                                    } as any}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {filteredCities.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-muted-foreground">No experiences found for this selection.</p>
                </div>
            )}
        </div>
    )
}
