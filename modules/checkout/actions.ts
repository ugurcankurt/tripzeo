/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from "@/lib/supabase/server"
import { iyzipayClient } from "@/lib/iyzipay-client"
import { headers } from "next/headers"

export async function initializePayment(bookingId: string) {
    const supabase = await createClient()

    // 1. Fetch Booking & User Details
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            experience:experiences(title, category, currency),
            user:profiles!user_id(*)
        `)
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        return { error: "Booking not found." }
    }

    if (!booking.user) {
        return { error: "User profile not found." }
    }

    // 2. Prepare Iyzipay Request
    // Note: We need a dynamic Callback URL. 
    // In dev: localhost:3000/api/payment/callback
    // In prod: tripzeo.com/api/payment/callback
    // We can use headers() to get host.
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const callbackUrl = `${protocol}://${host}/api/payment/callback?booking_id=${bookingId}`

    // Get Real IP
    const forwardedFor = headersList.get('x-forwarded-for')
    let realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
    if (realIp === '127.0.0.1' || realIp === '::1' || realIp === 'localhost') {
        realIp = '85.34.78.112' // Fallback to a real-looking IP
    }

    const fullName = (booking.user.full_name || 'Guest User').trim();
    const lastSpaceIndex = fullName.lastIndexOf(' ');
    const name = lastSpaceIndex === -1 ? fullName : fullName.substring(0, lastSpaceIndex);
    const surname = lastSpaceIndex === -1 ? 'User' : fullName.substring(lastSpaceIndex + 1);

    // Clean Phone Number: numbers only
    const cleanPhone = (booking.user.phone || '+905555555555').replace(/[^0-9+]/g, '');

    // Price Formatting: Iyzico prefers "10.0" format
    const formattedPrice = Number(booking.total_amount).toFixed(1);

    const request = {
        locale: 'en',
        conversationId: bookingId,
        price: formattedPrice,
        paidPrice: formattedPrice,
        currency: booking.experience?.currency || 'USD',
        basketId: bookingId,
        paymentGroup: 'PRODUCT',
        callbackUrl: callbackUrl,
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
            id: booking.user.id,
            name: name || 'Guest',
            surname: surname || 'User',
            gsmNumber: cleanPhone,
            email: booking.user.email,
            identityNumber: '11111111111',
            lastLoginDate: new Date().toISOString().replace('T', ' ').split('.')[0],
            registrationDate: booking.user.created_at ? new Date(booking.user.created_at).toISOString().replace('T', ' ').split('.')[0] : new Date().toISOString().replace('T', ' ').split('.')[0],
            registrationAddress: (booking.user.address || 'Istanbul').substring(0, 100),
            ip: realIp,
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            zipCode: booking.user.zip_code || '34000'
        },
        shippingAddress: {
            contactName: fullName,
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            address: booking.user.address || 'Istanbul',
            zipCode: booking.user.zip_code || '34000'
        },
        billingAddress: {
            contactName: fullName,
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            address: booking.user.address || 'Istanbul',
            zipCode: booking.user.zip_code || '34000'
        },
        basketItems: [
            {
                id: booking.experience_id,
                name: booking.experience?.title || 'Experience',
                category1: booking.experience?.category || 'General',
                itemType: 'VIRTUAL',
                price: formattedPrice
            }
        ]
    }

    // 3. Call Iyzipay (Pre-Authorization)
    try {
        const result = await iyzipayClient.post('/payment/iyzipos/checkoutform/initialize/preauth/ecom', request);

        if (result.status !== 'success') {
            const errorMsg = result.errorMessage || 'Invalid request';
            const errorCode = result.errorCode ? ` (${result.errorCode})` : '';
            console.error('Iyzipay Init Error:', errorMsg + errorCode)
            return { error: errorMsg + errorCode }
        }

        return { htmlContent: result.checkoutFormContent }
    } catch (error: unknown) {
        console.error("Iyzipay Exception:", error)
        return { error: error instanceof Error ? error.message : "Payment initialization failed." }
    }
}

export async function processDirectPayment(bookingId: string, cardData: {
    cardHolderName: string
    cardNumber: string
    expireMonth: string
    expireYear: string
    cvc: string
}) {
    const supabase = await createClient()

    // 1. Fetch Booking
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            experience:experiences(title, category, currency),
            user:profiles!user_id(*)
        `)
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking || !booking.user) {
        return { error: "Booking or user not found." }
    }

    // 2. Prepare Request
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    let realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
    if (realIp === '127.0.0.1' || realIp === '::1' || realIp === 'localhost') {
        realIp = '85.34.78.112'
    }

    const fullName = (booking.user.full_name || 'Guest User').trim();
    const lastSpaceIndex = fullName.lastIndexOf(' ');
    const name = lastSpaceIndex === -1 ? fullName : fullName.substring(0, lastSpaceIndex);
    const surname = lastSpaceIndex === -1 ? 'User' : fullName.substring(lastSpaceIndex + 1);
    const cleanPhone = (booking.user.phone || '+905555555555').replace(/[^0-9+]/g, '');
    const formattedPrice = Number(booking.total_amount).toFixed(1);

    const request = {
        locale: 'en',
        conversationId: bookingId,
        price: formattedPrice,
        paidPrice: formattedPrice,
        currency: booking.experience?.currency || 'USD',
        basketId: bookingId,
        paymentGroup: 'PRODUCT',
        paymentCard: {
            cardHolderName: cardData.cardHolderName,
            cardNumber: cardData.cardNumber,
            expireMonth: cardData.expireMonth,
            expireYear: cardData.expireYear,
            cvc: cardData.cvc,
            registerCard: '0'
        },
        buyer: {
            id: booking.user.id,
            name: name || 'Guest',
            surname: surname || 'User',
            gsmNumber: cleanPhone,
            email: booking.user.email,
            identityNumber: '11111111111',
            lastLoginDate: new Date().toISOString().replace('T', ' ').split('.')[0],
            registrationDate: booking.user.created_at ? new Date(booking.user.created_at).toISOString().replace('T', ' ').split('.')[0] : new Date().toISOString().replace('T', ' ').split('.')[0],
            registrationAddress: (booking.user.address || 'Istanbul').substring(0, 100),
            ip: realIp,
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            zipCode: booking.user.zip_code || '34000'
        },
        shippingAddress: {
            contactName: fullName,
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            address: booking.user.address || 'Istanbul',
            zipCode: booking.user.zip_code || '34000'
        },
        billingAddress: {
            contactName: fullName,
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            address: booking.user.address || 'Istanbul',
            zipCode: booking.user.zip_code || '34000'
        },
        basketItems: [
            {
                id: booking.experience_id,
                name: booking.experience?.title || 'Experience',
                category1: booking.experience?.category || 'General',
                itemType: 'VIRTUAL',
                price: formattedPrice
            }
        ]
    }

    // 3. Call Iyzipay (Pre-Authorization)
    try {
        const result = await iyzipayClient.post('/payment/iyzipos/preauth/ecom', request);

        if (result.status !== 'success') {
            const errorMsg = result.errorMessage || 'Payment failed';
            const errorCode = result.errorCode ? ` (${result.errorCode})` : '';
            console.error('Iyzipay Auth Error:', errorMsg + errorCode)
            return { error: errorMsg + errorCode }
        }

        // Success!
        const paymentId = result.paymentId
        let paymentTransactionId = result.paymentTransactionId
        if (!paymentTransactionId && result.itemTransactions && result.itemTransactions.length > 0) {
            paymentTransactionId = result.itemTransactions[0].paymentTransactionId
        }

        // Use Service Role to bypass RLS for status update (Critical)
        const { createClient: createServiceClient } = require('@supabase/supabase-js')
        const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error: updateError } = await serviceClient
            .from('bookings')
            .update({
                status: 'pending_host_approval',
                payment_id: paymentId,
                payment_transaction_id: paymentTransactionId
            })
            .eq('id', bookingId)

        if (updateError) {
            console.error('Booking update error:', updateError)
            return { error: 'Payment successful but failed to update booking status.' }
        }

        return {
            success: true,
            redirectUrl: `/account/orders?payment=success&booking_id=${bookingId}`
        }

    } catch (error: unknown) {
        console.error("Iyzipay Exception:", error)
        return { error: error instanceof Error ? error.message : "Payment processing failed." }
    }
}
