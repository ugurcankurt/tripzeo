'use client'

import * as React from "react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Grid } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

interface ExperienceGalleryProps {
    images?: string[]
    title?: string
}

export function ExperienceGallery({ images, title }: ExperienceGalleryProps) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
    const displayImages = images?.slice(0, 5) || []

    if (!displayImages.length) {
        return (
            <div className="w-full rounded-xl overflow-hidden bg-muted">
                <AspectRatio ratio={16 / 9}>
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No images available
                    </div>
                </AspectRatio>
            </div>
        )
    }

    return (
        <div className="relative rounded-xl overflow-hidden bg-background">
            {/* Mobile View: Swipeable Carousel */}
            <div className="block md:hidden">
                <Carousel className="w-full" opts={{ loop: true }}>
                    <CarouselContent>
                        {images?.map((img, index) => (
                            <CarouselItem key={index}>
                                <div
                                    className="relative aspect-[4/3] w-full"
                                    onClick={() => {
                                        setCurrentImageIndex(index)
                                        setIsDialogOpen(true)
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`${title || 'Experience'} - ${index + 1}`}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                        1 / {images?.length}
                    </div>
                </Carousel>
            </div>

            {/* Desktop View: Bento Grid */}
            <div className="hidden md:grid grid-cols-4 gap-2 h-[450px]">
                {/* Main Large Image (Span 2 cols, 2 rows -> Half width, Full height) */}
                <div
                    className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
                    onClick={() => {
                        setCurrentImageIndex(0)
                        setIsDialogOpen(true)
                    }}
                >
                    <img
                        src={displayImages[0]}
                        alt={title || "Experience main image"}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Secondary Images */}
                <div className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden" onClick={() => { setCurrentImageIndex(1); setIsDialogOpen(true); }}>
                    <img src={displayImages[1]} alt={title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden rounded-tr-xl" onClick={() => { setCurrentImageIndex(2); setIsDialogOpen(true); }}>
                    <img src={displayImages[2]} alt={title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden" onClick={() => { setCurrentImageIndex(3); setIsDialogOpen(true); }}>
                    <img src={displayImages[3]} alt={title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden rounded-br-xl" onClick={() => { setCurrentImageIndex(4); setIsDialogOpen(true); }}>
                    <img src={displayImages[4]} alt={title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                    {/* "View All" Button Overlay on the last image */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="font-semibold shadow-sm pointer-events-none">
                            <Grid className="w-4 h-4 mr-2" />
                            Show all photos
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="max-w-none sm:max-w-none w-screen h-screen p-0 bg-black/95 border-none rounded-none flex flex-col items-center justify-center dialog-content-fullscreen"
                    showCloseButton={false} // We will implement our own custom close button
                >
                    <DialogTitle className="sr-only">Experience Photo Gallery</DialogTitle>
                    <DialogDescription className="sr-only">
                        Swipe or click to view all photos of this experience.
                    </DialogDescription>

                    {/* Custom Close Button */}
                    <div className="absolute top-4 right-4 z-[60]">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDialogOpen(false)}
                            className="text-white hover:bg-white/20 rounded-full h-12 w-12"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-6 w-6"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>

                    <div className="w-full h-full flex items-center justify-center p-4">
                        <Carousel
                            className="w-full h-full max-w-[100vw] [&_[data-slot=carousel-content]]:h-full"
                            opts={{ startIndex: currentImageIndex }}
                        >
                            <CarouselContent className="h-full">
                                {images?.map((img, index) => (
                                    <CarouselItem key={index} className="flex items-center justify-center h-full relative pl-0">
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img
                                                src={img}
                                                alt={`${title} - ${index + 1}`}
                                                className="object-contain max-h-[90vh] max-w-[90vw] w-auto h-auto shadow-lg"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 z-50">
                                <CarouselPrevious className="static translate-y-0 h-10 w-10 md:h-14 md:w-14 rounded-full border-white/20 bg-black/50 hover:bg-black/70 text-white" />
                            </div>
                            <div className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 z-50">
                                <CarouselNext className="static translate-y-0 h-10 w-10 md:h-14 md:w-14 rounded-full border-white/20 bg-black/50 hover:bg-black/70 text-white" />
                            </div>
                        </Carousel>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
