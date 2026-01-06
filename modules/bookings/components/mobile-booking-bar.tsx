'use client'

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetHeader,
    SheetDescription,
} from "@/components/ui/sheet"
import { BookingForm } from "./booking-form"
import Link from "next/link"

import { Tables } from "@/types/supabase"

type ExperienceRow = Tables<'experiences'>

interface MobileBookingBarProps extends Partial<Pick<ExperienceRow, 'price' | 'capacity'>> {
    experienceId?: string
    currentUserId?: string
    hostId?: string
    serviceFeeRate?: number
    blockedDates?: string[]
}

export function MobileBookingBar(props: MobileBookingBarProps) {
    const { price } = props

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price || 0)

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-[60] lg:hidden safe-area-bottom">
            <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                <div className="flex flex-col">
                    <span className="font-bold text-lg">{formattedPrice}</span>
                    <span className="text-xs text-muted-foreground font-medium">/ guest</span>
                </div>

                {(!!props.currentUserId && props.currentUserId === props.hostId) ? (
                    <Button
                        size="lg"
                        className="font-semibold px-8 shadow-sm flex-1 ml-4"
                        asChild
                    >
                        <Link href={`/vendor/products/${props.experienceId}/edit`}>
                            Manage Experience
                        </Link>
                    </Button>
                ) : (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                size="lg"
                                className="font-semibold px-8 shadow-sm"
                            >
                                Request to Book
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[100dvh] rounded-none p-0 overflow-y-auto w-full max-w-none border-none z-50">
                            <div className="h-full flex flex-col max-w-md mx-auto w-full px-4 py-6 pb-32">
                                <SheetHeader className="mb-6 text-left p-0">
                                    <SheetTitle className="text-2xl font-bold">Complete your booking</SheetTitle>
                                    <SheetDescription className="text-sm text-muted-foreground">
                                        Select your dates and guests to proceed with the booking.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex-1">
                                    <BookingForm {...props} />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </div>
    )
}
