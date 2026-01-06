'use client'

import React from 'react'
import { format } from "date-fns"
import { Calendar, Clock, MapPin, User, Hash, QrCode, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { Tables } from "@/types/supabase"

type BookingWithRelations = Tables<'bookings'> & {
    experience: Tables<'experiences'> | null
    host: Tables<'profiles'> | null
    guest: Tables<'profiles'> | null
}

interface TicketContentProps {
    booking: BookingWithRelations
}

export function TicketContent({ booking }: TicketContentProps) {
    if (!booking) return null

    const experience = booking.experience
    const host = booking.host
    const guest = booking.guest

    const formattedDate = booking.booking_date ? format(new Date(booking.booking_date), "PPP") : "Date not set"
    const startTime = booking.start_time ? booking.start_time.slice(0, 5) : "TBD"
    const endTime = booking.end_time ? booking.end_time.slice(0, 5) : ""

    // Calculate total price display
    const currencySymbol = experience?.currency === 'USD' ? '$' : experience?.currency === 'EUR' ? '€' : '₺'

    return (
        <div className="w-full space-y-6">
            <Card className="border-2 border-dashed shadow-none print:border-black print:shadow-none bg-white">
                {/* Header Section */}
                <CardHeader className="bg-primary/5 border-b-2 border-dashed pb-8 rounded-t-lg print:border-black">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <Badge variant="outline" className="mb-2 bg-white text-primary border-primary/20">
                                Confirm Code: {booking.id.slice(0, 8).toUpperCase()}
                            </Badge>
                            <CardTitle className="text-2xl font-bold">{experience?.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4" />
                                {experience?.location_city}, {experience?.location_address}
                            </CardDescription>
                        </div>
                        <div className="hidden md:block">
                            {/* QR Code Placeholder */}
                            <div className="bg-white p-2 rounded-lg border border-border shadow-sm">
                                <QrCode className="h-24 w-24 text-foreground/80" />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-8 grid gap-8">
                    {/* Time & Date Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Date
                            </span>
                            <p className="font-semibold text-lg">{formattedDate}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Time
                            </span>
                            <p className="font-semibold text-lg">{startTime} {endTime && `- ${endTime}`}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                                <User className="h-3 w-3" /> Guests
                            </span>
                            <p className="font-semibold text-lg">{booking.attendees_count} Person</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                                <Hash className="h-3 w-3" /> Total Paid
                            </span>
                            <p className="font-semibold text-lg">{currencySymbol}{booking.total_amount}</p>
                        </div>
                    </div>

                    <Separator className="border-dashed" />

                    {/* People Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Guest Info */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Guest Information</h4>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {guest?.full_name?.charAt(0) || "G"}
                                </div>
                                <div>
                                    <p className="font-medium">{guest?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{guest?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Host Info */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Host Information</h4>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                                    {host?.full_name?.charAt(0) || "H"}
                                </div>
                                <div>
                                    <p className="font-medium">{host?.full_name}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" /> {host?.email}
                                    </div>
                                    {host?.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-3 w-3" /> {host?.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation / Notes */}
                    <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                        <p>
                            <strong>Important Note:</strong> Please arrive 15 minutes before the start time.
                            If you need to cancel or reschedule, please verify the policy or contact your host directly.
                        </p>
                    </div>

                    {/* Mobile QR Code (Visible only on small screens) */}
                    <div className="md:hidden flex justify-center py-4">
                        <div className="bg-white p-2 rounded-lg border border-border shadow-sm">
                            <QrCode className="h-32 w-32 text-foreground" />
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="bg-muted/10 border-t-2 border-dashed py-4 justify-center text-center text-xs text-muted-foreground rounded-b-lg print:border-black">
                    <p>Ticket ID: {booking.id} • Booking Status: <span className="uppercase font-semibold">{(booking.status || 'Unknown').replace('_', ' ')}</span></p>
                </CardFooter>
            </Card>
        </div>
    )
}
