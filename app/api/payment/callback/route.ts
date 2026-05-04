import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { iyzipayClient } from '@/lib/iyzipay-client'
import { Database } from '@/types/supabase'
import { sendServerEvent } from '@/lib/meta-capi'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const token = formData.get('token') as string

        if (!token) {
            return NextResponse.json({ error: 'Token not found' }, { status: 400 })
        }

        // Iyzipay'den sonucu sorgula
        // Promise wrapper kullanıyoruz çünkü iyzipay callback tabanlı
        const result = await iyzipayClient.post('/payment/iyzipos/checkoutform/auth/ecom/detail', {
            locale: 'en',
            token: token
        });

        if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
            // Ödeme başarısız
            console.error('Payment failed:', result.errorMessage)
            return NextResponse.redirect(new URL(`/checkout/${result.basketId}?error=${encodeURIComponent(result.errorMessage)}`, request.url), { status: 303 })
        }

        // Ödeme Başarılı!
        const bookingId = result.basketId
        const paymentId = result.paymentId

        // Extract Payment Transaction ID (might be in itemTransactions)
        let paymentTransactionId = result.paymentTransactionId
        if (!paymentTransactionId && result.itemTransactions && result.itemTransactions.length > 0) {
            paymentTransactionId = result.itemTransactions[0].paymentTransactionId
        }

        // Service Role ile Supabase client oluştur (RLS bypass)
        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Booking durumunu güncelle
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'pending_host_approval',
                payment_id: paymentId,
                payment_transaction_id: paymentTransactionId // Save this for Post-Auth capture
            })
            .eq('id', bookingId)

        if (error) {
            console.error('Booking update error:', error)
            return NextResponse.redirect(new URL(`/checkout/${bookingId}?error=DatabaseUpdateError`, request.url), { status: 303 })
        }

        // Fetch booking details for Meta CAPI
        const { data: bookingData } = await supabase
            .from('bookings')
            .select(`
                total_amount,
                experience:experiences(currency),
                user:profiles!user_id(email, phone, city, country, zip_code)
            `)
            .eq('id', bookingId)
            .single()

        if (bookingData && bookingData.user) {
            const forwardedFor = request.headers.get('x-forwarded-for')
            const realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
            const userAgent = request.headers.get('user-agent') || ''
            
            // Fbp and fbc might be in cookies
            const fbp = request.cookies.get('_fbp')?.value
            const fbc = request.cookies.get('_fbc')?.value

            await sendServerEvent(
                'Purchase',
                Math.floor(Date.now() / 1000),
                {
                    email: bookingData.user.email,
                    phone: bookingData.user.phone || undefined,
                    city: bookingData.user.city || undefined,
                    country: bookingData.user.country || undefined,
                    zip: bookingData.user.zip_code || undefined,
                    client_ip_address: realIp,
                    client_user_agent: userAgent,
                    fbp,
                    fbc
                },
                {
                    value: bookingData.total_amount,
                    currency: bookingData.experience?.currency || 'USD',
                    content_name: 'Experience Booking',
                    content_ids: [bookingId],
                },
                bookingId // Use booking ID as event_id for deduplication
            )
        }

        // FİNANSAL KAYIT: ŞİMDİLİK EKLENMİYOR
        // Çünkü bu sadece "blokaj" işlemidir. Para henüz hesaba geçmedi.
        // Host onayladığında (Post-Auth) finansal kayıt atılacak.

        // Check if this is a new user flow (Guest booking)
        const isNewUser = request.nextUrl.searchParams.get('is_new_user') === 'true'

        // Başarılı sayfasına veya Hesabım sayfasına yönlendir
        if (isNewUser) {
            return NextResponse.redirect(new URL(`/reset-password`, request.url), { status: 303 })
        }

        return NextResponse.redirect(new URL(`/account/orders?payment=success&booking_id=${bookingId}`, request.url), { status: 303 })

    } catch (error: any) {
        console.error('Callback error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
