import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { TicketContent } from "@/modules/bookings/components/ticket-content"
import { Button } from "@/components/ui/button"
import { TicketActions } from "@/modules/bookings/components/ticket-actions"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function TicketPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: booking } = await supabase
        .from('bookings')
        .select(`
            *,
            experience:experiences(*),
            host:profiles!bookings_host_id_fkey(*),
            guest:profiles!bookings_user_id_fkey(*)
        `)
        .eq('id', id)
        .single() // ... existing lines

    // ...

    if (!booking) {
        notFound()
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Güvenlik: Kullanıcı giriş yapmış olmalı
    if (!user) {
        redirect('/login')
    }

    // Güvenlik: Sadece sahibi, host veya admin görebilir
    if (booking.user_id !== user.id && booking.host_id !== user.id) {
        // Rol kontrolü de yapılabilir ama şimdilik simple ownership check
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') {
            return (
                <div className="container py-20 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
                    <p>You are not authorized to view this ticket.</p>
                </div>
            )
        }
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Event", // Or TravelEvent
        "name": booking.experience?.title || "Experience Booking",
        "startDate": booking.start_time, // Assuming ISO string
        "location": {
            "@type": "Place",
            "name": booking.experience?.location_city,
            "address": booking.experience?.location_address
        },
        "organizer": {
            "@type": "Person",
            "name": booking.host?.full_name
        },
        "offers": {
            "@type": "Offer",
            "price": booking.total_amount,
            "priceCurrency": booking.experience?.currency || "USD",
            "availability": "https://schema.org/SoldOut" // Since it's a specific ticket
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://tripzeo.com"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Tickets",
                    "item": "https://tripzeo.com/account/orders" // Logic link
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Ticket Details",
                    "item": `https://tripzeo.com/tickets/${id}`
                }
            ]
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4 print:py-0 print:px-0 print:max-w-none">
            {/* Visual Breadcrumbs (Hidden in Print) */}
            <div className="mb-6 print:hidden">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/account/orders">Orders</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Ticket Setup</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Schema.org */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <TicketContent booking={booking} />
            <div className="mt-8 flex flex-col items-center gap-4 print:hidden">
                <TicketActions />
                <Button variant="outline" asChild>
                    <Link href="/account/orders">Back to Orders</Link>
                </Button>
            </div>
        </div>
    )
}
