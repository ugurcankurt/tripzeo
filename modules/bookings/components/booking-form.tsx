'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown, Briefcase, Edit } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { Tables } from "@/types/supabase"

type ExperienceRow = Tables<'experiences'>

interface BookingFormProps extends Partial<Pick<ExperienceRow, 'price' | 'capacity'>> {
    experienceId?: string
    currentUserId?: string
    hostId?: string
    serviceFeeRate?: number
    blockedDates?: string[]
}

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { isSameDay, parseISO } from "date-fns"
import { createClient } from "@/lib/supabase/client"

export function BookingForm({ price, serviceFeeRate, experienceId, blockedDates = [], currentUserId, hostId }: BookingFormProps) {
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [guests, setGuests] = React.useState<number>(1)
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
    const router = useRouter()

    // Calculate totals
    const subtotal = (price || 0) * guests
    const serviceFee = subtotal * (serviceFeeRate || 0)
    const total = subtotal + serviceFee

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price || 0)

    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(total)

    const formattedServiceFee = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(serviceFee)

    const handleBook = () => {
        if (!date) {
            toast.error("Please select a date.")
            return
        }
        if (!experienceId) {
            toast.error("Experience not found.")
            return
        }

        const params = new URLSearchParams({
            experienceId,
            date: date.toISOString(),
            people: guests.toString()
        })

        router.push(`/book?${params.toString()}`)
    }

    const [blockedDatesState, setBlockedDatesState] = React.useState<string[]>(blockedDates)

    // Sync prop changes (if any revalidation happens parent side)
    React.useEffect(() => {
        setBlockedDatesState(blockedDates)
    }, [blockedDates])

    // Real-time subscription
    React.useEffect(() => {
        if (!experienceId) return

        const supabase = createClient()

        // Listen for blocked dates changes
        const availabilityChannel = supabase.channel(`public:experience_availability:${experienceId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'experience_availability',
                    filter: `experience_id=eq.${experienceId}`
                },
                (payload: any) => {
                    const newRow = payload.new as any
                    const oldRow = payload.old as any

                    if (payload.eventType === 'INSERT') {
                        setBlockedDatesState(prev => [...prev, newRow.date])
                    } else if (payload.eventType === 'DELETE') {
                        setBlockedDatesState(prev => prev.filter(d => d !== oldRow.date))
                    }
                }
            )
            .subscribe()

        // Listen for new bookings (confirmed ones block dates too)
        const bookingsChannel = supabase.channel(`public:bookings:${experienceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bookings',
                    filter: `experience_id=eq.${experienceId}`
                },
                (payload) => {
                    const newBooking = payload.new as any
                    // Only care if confirmed? Or pending too? 
                    // Usually pending blocks it temporarily or we wait for confirm.
                    // For now, let's assume if a booking is inserted and status is confirmed/paid/etc
                    // But usually initial insert is pending.
                    // Let's stick to explicit blocks for now as 'bookings' might require complex date parsing 
                    // (booking_date vs start/end time ranges).
                    // If the host manually blocks via calendar, it goes to experience_availability.
                    // If a user blocks it by booking, does it go to experience_availability?
                    // Currently NO. The system relies on checking both tables.

                    // So we MUST listen to bookings too if we want to be 100% real-time for purchases.
                    // Let's just create a toast for now or simple refresh? 
                    // router.refresh() is easiest to catch everything including complex logic.
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(availabilityChannel)
            supabase.removeChannel(bookingsChannel)
        }
    }, [experienceId, router])

    // Helper to check if a date is blocked
    const isDateBlocked = (date: Date) => {
        return blockedDatesState.some(blockedDate => isSameDay(parseISO(blockedDate), date))
    }

    // Start of Host View Logic
    const isHost = currentUserId && hostId && currentUserId === hostId

    if (isHost) {
        return (
            <Card className="shadow-lg border-primary/20 bg-primary/5 sticky top-24">
                <CardHeader className="p-6 pb-2">
                    <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                        <span className="bg-primary/10 p-1 rounded-md">
                            <Briefcase className="w-4 h-4" />
                        </span>
                        <span>Host Management</span>
                    </div>
                    <h3 className="text-xl font-bold">This is your experience</h3>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">
                        Manage your pricing, availability, and details directly from your dashboard.
                    </p>

                    <div className="grid gap-3">
                        <Button
                            className="w-full justify-start h-12 font-medium"
                            variant="default"
                            asChild
                        >
                            <Link href={`/vendor/products/${experienceId}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Experience Details
                            </Link>
                        </Button>

                        <Button
                            className="w-full justify-start h-12 font-medium border-primary/20 hover:bg-primary/10"
                            variant="outline"
                            asChild
                        >
                            <Link href="/vendor/calendar">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Manage Availability & Dates
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }
    // End of Host View Logic

    return (
        <Card className="shadow-lg border-border/50 sticky top-24">
            <CardHeader className="p-6 pb-4">
                <div className="flex items-end justify-between">
                    <div>
                        <span className="text-2xl font-bold">{formattedPrice}</span>
                        <span className="text-muted-foreground text-sm font-medium"> / guest</span>
                    </div>
                    {/* Placeholder for rating if needed */}
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid gap-2">
                    {/* Date Picker */}
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => {
                                    setDate(d);
                                    setIsCalendarOpen(false);
                                }}
                                disabled={(date) => date < new Date() || isDateBlocked(date)}
                                initialFocus
                                className="w-full"
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Guest Selector */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between h-12 font-normal">
                                <span>{guests} Guest{guests > 1 ? 's' : ''}</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4" align="center">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Guests</span>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        disabled={guests <= 1}
                                        onClick={() => setGuests(guests - 1)}
                                    >
                                        -
                                    </Button>
                                    <span className="w-4 text-center">{guests}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        disabled={guests >= (10)} // simple max cap
                                        onClick={() => setGuests(guests + 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Button
                    className="w-full text-lg font-semibold h-12"
                    size="lg"
                    disabled={!date}
                    onClick={handleBook}
                >
                    Request to Book
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-2">
                    You won't be charged yet
                </p>

                <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                        <span className="underline decoration-muted-foreground/50">
                            {formattedPrice} x {guests} guest{guests > 1 ? 's' : ''}
                        </span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="underline decoration-muted-foreground/50">Service fee</span>
                        <span>{formattedServiceFee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formattedTotal}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
