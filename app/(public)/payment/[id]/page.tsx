import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CustomPaymentForm } from "@/modules/checkout/components/custom-payment-form"
import { Lock } from "lucide-react"

export default async function PaymentPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: booking } = await supabase
        .from('bookings')
        .select(`
        *,
        experience:experiences(title, price, location_city, currency)
    `)
        .eq('id', id)
        .single()

    if (!booking) notFound()

    // Sadece rezervasyon sahibi görebilir
    if (booking.user_id !== user.id) redirect('/')

    // Eğer ödeme zaten yapılmışsa veya iptal edilmişse ana sayfaya yönlendir
    if (booking.status !== 'pending_payment') {
        redirect('/account/orders')
    }

    // Custom form renders directly, no pre-initialization needed.

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Sol: Sipariş Özeti */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">{booking.experience.title}</h3>
                                <p className="text-muted-foreground text-sm">{booking.experience.location_city}</p>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span>Date</span>
                                <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Number of People</span>
                                <span>{booking.attendees_count} People</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Amount</span>
                                <span>${booking.total_amount}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm">
                        <p>
                            <strong>Pay Safe Protection:</strong> Your payment is held in Tripzeo escrow until the experience takes place.
                        </p>
                    </div>
                </div>

                {/* Sağ: Ödeme Formu (Iyzipay) */}
                <div>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Card Details</CardTitle>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">Secure</span>
                                </div>
                            </div>
                            <CardDescription>Pay securely with Iyzipay infrastructure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Custom Payment Form (Direct API) */}
                            <CustomPaymentForm
                                bookingId={id}
                                price={booking.total_amount}
                                currency={booking.experience?.currency || 'USD'}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
