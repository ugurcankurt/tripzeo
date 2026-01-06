"use client"
import { useState, useTransition } from 'react'
import { Tables } from "@/types/supabase"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Eye, MapPin, Image as ImageIcon, Star, MessageCircle, Trash2, MoreVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn, slugify } from "@/lib/utils"
import { deleteExperience, toggleExperienceStatus } from "../actions"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VendorExperienceCardProps {
    experience: Tables<'experiences'>
}

export function VendorExperienceCard({ experience }: VendorExperienceCardProps) {
    const [isPending, startTransition] = useTransition()
    const [optimisticActive, setOptimisticActive] = useState(experience.is_active)
    const coverImage = experience.images?.[0]

    // Construct SEO-friendly URL
    const countrySlug = slugify(experience.location_country || 'turkey')
    const citySlug = slugify(experience.location_city)
    const titleSlug = slugify(experience.title)
    const experienceSlug = `${titleSlug}-${experience.id}`
    const experienceUrl = `/${countrySlug}/${citySlug}/${experienceSlug}`

    const handleToggleStatus = (checked: boolean) => {
        setOptimisticActive(checked)
        startTransition(async () => {
            const result = await toggleExperienceStatus(experience.id, checked)
            if (result.error) {
                setOptimisticActive(!checked) // Revert on error
                toast.error(result.error)
            } else {
                toast.success(checked ? "Experience user published" : "Experience unpublished")
            }
        })
    }

    const handleDelete = async () => {
        const result = await deleteExperience(experience.id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Experience deleted")
        }
    }

    return (
        <Card className="overflow-hidden flex flex-col h-full group hover:shadow-md transition-all duration-300 border-border/50 p-0">
            {/* Image Section */}
            <div className="relative aspect-video w-full bg-muted overflow-hidden rounded-t-[inherit]">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={experience.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}

                {/* Top Overlay Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    {/* Toggle Publish Status */}
                    <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm flex items-center gap-2 border">
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", optimisticActive ? "text-green-600" : "text-muted-foreground")}>
                            {optimisticActive ? "Live" : "Draft"}
                        </span>
                        <Switch
                            checked={optimisticActive ?? false}
                            onCheckedChange={handleToggleStatus}
                            className="scale-75 data-[state=checked]:bg-green-600"
                            disabled={isPending}
                        />
                    </div>

                    {/* Options Menu */}
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/vendor/products/${experience.id}/edit`} className="cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={experienceUrl} target="_blank" className="cursor-pointer">
                                        <Eye className="mr-2 h-4 w-4" /> Preview
                                    </Link>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete
                                    <b> "{experience.title}"</b> and remove it from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Content Section */}
            <CardHeader className="p-4 space-y-2">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {experience.title}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">
                            {experience.location_city}, {experience.location_country}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 space-y-4">
                {/* Price */}
                <div className="flex items-baseline gap-1.5 border-b pb-3 border-border/50">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: experience.currency || 'USD' }).format(experience.price)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">/ person</span>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{experience.rating || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                        <MessageCircle className="h-4 w-4" />
                        <span>{experience.review_count || 0} reviews</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>{experience.images?.length || 0}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
