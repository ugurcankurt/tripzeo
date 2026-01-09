"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Star, Heart, MapPin, ArrowUpRight } from "lucide-react"

import type { ExperienceCardData } from "@/types/experiences"
import { getExperienceUrl } from "@/lib/utils"
import { useFavorite } from "@/hooks/use-favorite"

interface ExperienceCardProps {
    experience: ExperienceCardData
    className?: string
}

export function ExperienceCard({ experience, className }: ExperienceCardProps) {
    const router = useRouter()
    const { isFavorited, toggle: toggleLike, isLoading: isLikeLoading } = useFavorite(experience.id)
    const [imageLoaded, setImageLoaded] = useState(false)
    const imageRef = useRef<HTMLImageElement>(null)

    const { title, price, currency, location_city, location_country, images, rating } = experience

    const experienceUrl = getExperienceUrl(experience)

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)

    const coverImage = images && images.length > 0 ? images[0] : "/placeholder-experience.jpg"

    useEffect(() => {
        if (imageRef.current && imageRef.current.complete) {
            setImageLoaded(true)
        }
    }, [])

    const handleCardClick = () => {
        router.push(experienceUrl)
    }

    const handleLikeClick = (e: React.MouseEvent) => {
        toggleLike(e)
    }

    return (
        <article className={`group cursor-pointer ${className}`} onClick={handleCardClick}>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-muted ring-1 ring-border shadow-sm transition-all duration-500 group-hover:shadow-lg group-hover:ring-primary/20">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                )}

                <img
                    ref={imageRef}
                    src={coverImage}
                    alt={title}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-experience.jpg"
                        setImageLoaded(true)
                    }}
                    className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] ${imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                />

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <button
                    onClick={handleLikeClick}
                    disabled={isLikeLoading}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isFavorited
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                        : "bg-background/80 backdrop-blur-md text-foreground shadow-sm hover:bg-background"
                        }`}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart
                        className={`h-4 w-4 transition-all duration-300 ${isFavorited ? "fill-current" : ""}`}
                    />
                </button>

                {rating && (
                    <div className="absolute left-4 bottom-4 flex items-center gap-1.5">
                        <div className="flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-2.5 py-1 shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-foreground">{Number(rating).toFixed(1)}</span>
                        </div>
                    </div>
                )}

                <div className="absolute right-4 bottom-4 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-lg">
                        <ArrowUpRight className="h-4 w-4 text-foreground" />
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                        {location_city} · {location_country}
                    </span>
                </div>

                <h3 className="text-[15px] font-semibold leading-tight text-foreground line-clamp-2 transition-colors duration-200 group-hover:text-primary capitalize">
                    {title}
                </h3>

                <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-lg font-bold text-foreground">{formattedPrice}</span>
                    <span className="text-xs text-muted-foreground">/ person</span>
                </div>
            </div>
        </article>
    )
}
