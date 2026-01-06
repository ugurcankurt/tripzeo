"use client"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

import { ExperienceCardData } from "@/types/experiences"
import { getExperienceUrl } from "@/lib/utils"

interface ExperienceCardProps {
    experience: ExperienceCardData
    className?: string
}

export function ExperienceCard({ experience, className }: ExperienceCardProps) {
    const router = useRouter()
    const {
        title,
        price,
        currency,
        location_city,
        location_country,
        images,
        rating,
    } = experience

    const experienceUrl = getExperienceUrl(experience)

    // Format price
    const formattedPrice = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)

    const coverImage = images && images.length > 0 ? images[0] : '/placeholder-experience.jpg'

    const handleCardClick = () => {
        router.push(experienceUrl)
    }

    return (
        <div
            className={`group cursor-pointer flex flex-col gap-2 ${className}`}
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/50">
                <img
                    src={coverImage}
                    alt={title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 will-change-transform"
                />
            </div>

            {/* Content Details */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground">
                        {title}
                    </h3>
                </div>

                <p className="text-muted-foreground text-sm">
                    {location_city}, {location_country}
                </p>

                <div className="flex items-center gap-1 mt-1">
                    <span className="font-semibold text-foreground">
                        {formattedPrice}
                    </span>
                    <span className="text-foreground">/misafir</span>
                </div>

                <div className="flex items-center gap-1 text-sm">
                    <div className="flex items-center">
                        <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                    </div>
                    <span className="font-medium">{Number(rating || 0).toFixed(1)}</span>
                    {experience.review_count && experience.review_count > 0 && (
                        <span className="text-muted-foreground">({experience.review_count})</span>
                    )}
                </div>
            </div>
        </div>
    )
}
