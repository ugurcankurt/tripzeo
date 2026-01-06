import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { initializePayment } from "@/modules/checkout/actions"
import { CheckoutForm } from "@/modules/checkout/components/checkout-form"

export default async function PaymentPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: booking } = await supabase
        .from('bookings')
        .select(`
        *,
        experience:experiences(title, price, location_city)
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

    // Ödeme başlat
    let paymentFormHtml = null
    let error = null

    try {
        const result = await initializePayment(id) as any
        if (result.error) {
            error = result.error
        } else {
            paymentFormHtml = result.htmlContent
        }
    } catch (err: any) {
        error = err.error || 'Payment could not be initialized.'
    }

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
                    {error ? (
                        <div className="bg-red-50 p-4 border border-red-200 rounded text-red-600">
                            <p>Error: {error}</p>
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Card Details</CardTitle>
                                <CardDescription>Pay securely with Iyzipay infrastructure.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Iyzipay Scripti Client Side'da çalışmalı */}
                                <CheckoutForm htmlContent={paymentFormHtml} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
