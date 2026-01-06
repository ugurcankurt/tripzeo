"use client"

import * as React from "react"
import { useState, useTransition, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { toggleBlockDate } from "@/modules/calendar/actions"
import { cn } from "@/lib/utils"
import { format, isSameDay, parseISO } from "date-fns"
import { Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CalendarBooking, CalendarBlockedDate, CalendarClientProps } from "@/modules/calendar/types"
import { useRouter } from "next/navigation"
import { Tables } from "@/types/supabase"


export function CalendarClient({ experiences, initialBookings, initialBlockedDates, hostId }: CalendarClientProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedExperience, setSelectedExperience] = useState<string>("all")
    const [bookings, setBookings] = useState<CalendarBooking[]>(initialBookings)
    const [blockedDates, setBlockedDates] = useState<CalendarBlockedDate[]>(initialBlockedDates)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Sync props with state (for when revalidatePath updates server data)
    useEffect(() => {
        // eslint-disable-next-line
        setBookings(initialBookings)
        // eslint-disable-next-line
        setBlockedDates(initialBlockedDates)
    }, [initialBookings, initialBlockedDates])

    // Supabase Realtime Subscription
    useEffect(() => {
        const supabase = createClient()

        // Channel for Bookings linked to this host
        const bookingChannel = supabase.channel('realtime-bookings')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `host_id=eq.${hostId}`
                },
                (payload) => {
                    // Refresh the page data on any booking change for this host
                    // We could do optimistic granular updates, but router.refresh() is safer for joined data
                    router.refresh()
                }
            )
            .subscribe()

        // Channel for Availability
        // Since we can't easily filter by host_id on the table, we'll refresh on ANY change 
        // that matches one of our experience IDs.
        // Actually, we can subscribe to the table and filter payload client-side?
        // Or simpler: Just listen to the table. If row.experience_id is in our list, refresh.
        const availabilityChannel = supabase.channel('realtime-availability')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                },
                (payload) => {
                    const newRow = payload.new as Tables<'experience_availability'>
                    const oldRow = payload.old as Tables<'experience_availability'>
                    const changedExperienceId = newRow?.experience_id || oldRow?.experience_id

                    // Check if the change belongs to one of our experiences
                    const isMyExperience = experiences.some(e => e.id === changedExperienceId)

                    if (isMyExperience) {
                        router.refresh()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(bookingChannel)
            supabase.removeChannel(availabilityChannel)
        }
    }, [hostId, experiences, router])

    // Filter data based on selection
    const filteredBookings = selectedExperience === "all"
        ? bookings
        : bookings.filter(b => b.experiences?.id === selectedExperience)

    const filteredBlocked = selectedExperience === "all"
        ? blockedDates
        : blockedDates.filter(b => b.experiences?.id === selectedExperience) // Use optional chaining for safety

    // Helper to check status of a day
    const getDayStatus = (day: Date) => {
        // Safe check for invalid dates in data
        const isBlocked = filteredBlocked.some(b => {
            try { return isSameDay(parseISO(b.date), day) } catch { return false }
        })
        const isBooked = filteredBookings.some(b => {
            try { return isSameDay(parseISO(b.booking_date), day) } catch { return false }
        })

        if (isBlocked) return 'blocked'
        if (isBooked) return 'booked'
        return 'available'
    }

    const handleDateSelect = async (newDate: Date | undefined) => {
        if (!newDate) return
        if (selectedExperience === "all") {
            toast.info("Please select a specific experience to manage availability.")
            return
        }

        const status = getDayStatus(newDate)

        // Prevent modifying past dates? (Optional, but good UX)
        if (newDate < new Date(new Date().setHours(0, 0, 0, 0))) {
            toast.error("Cannot modify past dates.")
            return
        }

        if (status === 'booked') {
            toast.warning("This date has existing bookings. Cancel them first to block.")
            return
        }

        const shouldBlock = status !== 'blocked' // Toggle

        // Optimistic Update
        const optimisticBlock: CalendarBlockedDate = {
            id: 'optimistic-' + Date.now(),
            date: format(newDate, 'yyyy-MM-dd'),
            experience_id: selectedExperience,
            is_blocked: true,
            experiences: experiences.find(e => e.id === selectedExperience) || null
        }

        startTransition(async () => {
            // Apply optimistic state
            if (shouldBlock) {
                setBlockedDates(prev => [...prev, optimisticBlock])
            } else {
                setBlockedDates(prev => prev.filter(b => !isSameDay(parseISO(b.date), newDate)))
            }

            const dateStr = format(newDate, 'yyyy-MM-dd')
            const result = await toggleBlockDate(selectedExperience, dateStr, shouldBlock)

            if (result.error) {
                // Revert on error
                toast.error(result.error)
                if (shouldBlock) {
                    setBlockedDates(prev => prev.filter(b => b.id !== optimisticBlock.id))
                } else {
                    // Re-add removed? Complex to revert perfectly without fetching, 
                    // but router.refresh() via realtime will likely handle sync soon.
                    router.refresh()
                }
            } else {
                toast.success(`Date ${shouldBlock ? 'blocked' : 'unblocked'} successfully.`)
            }
        })
    }

    // Custom modifiers for calendar styles
    const modifiers = {
        blocked: (date: Date) => getDayStatus(date) === 'blocked',
        booked: (date: Date) => getDayStatus(date) === 'booked',
    }

    const modifiersStyles = {
        blocked: { color: '#ef4444', textDecoration: 'line-through', opacity: 0.5, backgroundColor: '#fef2f2' }, // Red-ish for blocked
        booked: { fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7' }, // Green for booked
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold">Availability Manager</h2>
                    <p className="text-sm text-muted-foreground">Select an experience to manage dates.</p>
                </div>
                <div className="w-full md:w-[300px]">
                    <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select Experience" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">View All Experiences</SelectItem>
                            {experiences.map(exp => (
                                <SelectItem key={exp.id} value={exp.id}>{exp.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-none md:border md:shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Calendar</CardTitle>
                        {selectedExperience === "all" ? (
                            <CardDescription className="text-amber-600">⚠ Select an experience to edit availability.</CardDescription>
                        ) : (
                            <CardDescription>Click a date to block/unblock.</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 md:p-6 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            className="rounded-md border-none p-0"
                            modifiers={modifiers}
                            modifiersStyles={modifiersStyles}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            numberOfMonths={2}
                            pagedNavigation
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Status Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                                <div className="text-sm">
                                    <span className="font-medium text-foreground">Booked</span>
                                    <p className="text-xs text-muted-foreground">Confirmed bookings exists</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                                <div className="text-sm">
                                    <span className="font-medium text-foreground">Blocked</span>
                                    <p className="text-xs text-muted-foreground">Manually closed dates</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30"></div>
                                <div className="text-sm">
                                    <span className="font-medium text-foreground">Available</span>
                                    <p className="text-xs text-muted-foreground">Open for bookings</p>
                                </div>
                            </div>

                            {isPending && (
                                <div className="flex items-center gap-2 text-sm text-primary pt-2 border-t mt-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Updating availability...</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="max-h-[400px] overflow-hidden flex flex-col">
                        <CardHeader className="pb-3 bg-muted/20">
                            <CardTitle className="text-base">Upcoming Bookings</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-y-auto flex-1 p-0">
                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-12 px-4 text-muted-foreground text-sm">
                                    No upcoming bookings found.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredBookings.map((booking: CalendarBooking) => (
                                        <div key={booking.id} className="p-4 hover:bg-muted/30 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-medium text-sm">{format(parseISO(booking.booking_date), 'EEE, MMM d, yyyy')}</p>
                                                <span className={cn(
                                                    "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                                    booking.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                                        booking.status === 'completed' ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                                )}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{booking.experiences?.title}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span>👥 {booking.attendees_count} Guests</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
