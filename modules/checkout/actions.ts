/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from "@/lib/supabase/server"
import iyzipay from "@/lib/iyzipay"
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
    const realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'

    const fullName = booking.user.full_name || 'Guest User';
    const lastSpaceIndex = fullName.lastIndexOf(' ');
    const name = lastSpaceIndex === -1 ? fullName : fullName.substring(0, lastSpaceIndex);
    const surname = lastSpaceIndex === -1 ? 'User' : fullName.substring(lastSpaceIndex + 1);

    const request = {
        locale: 'en',
        conversationId: bookingId,
        price: booking.total_amount.toString(),
        paidPrice: booking.total_amount.toString(),
        currency: booking.experience?.currency || 'USD',
        basketId: bookingId,
        paymentGroup: 'PRODUCT',
        callbackUrl: callbackUrl,
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
            id: booking.user.id,
            name: name,
            surname: surname,
            gsmNumber: booking.user.phone || '+905555555555',
            email: booking.user.email,
            identityNumber: '11111111111', // Placeholder until identity_number is added to profiles
            lastLoginDate: new Date().toISOString().replace('T', ' ').split('.')[0], // Current login time
            registrationDate: booking.user.created_at ? new Date(booking.user.created_at).toISOString().replace('T', ' ').split('.')[0] : new Date().toISOString().replace('T', ' ').split('.')[0],
            registrationAddress: booking.user.address || 'Istanbul', // Fallback only if empty
            ip: realIp,
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            zipCode: booking.user.zip_code || '34000'
        },
        shippingAddress: {
            contactName: booking.user.full_name || 'Guest',
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            address: booking.user.address || 'Istanbul',
            zipCode: booking.user.zip_code || '34000'
        },
        billingAddress: {
            contactName: booking.user.full_name || 'Guest',
            city: booking.user.city || 'Istanbul',
            country: booking.user.country || 'Turkey',
            address: booking.user.address || 'Istanbul',
            zipCode: booking.user.zip_code || '34000'
        },
        basketItems: [
            {
                id: booking.experience_id,
                name: booking.experience.title,
                category1: booking.experience.category || 'Experience',
                itemType: 'VIRTUAL', // or PHYSICAL
                price: booking.total_amount.toString()
            }
        ]
    }

    // 3. Call Iyzipay (Pre-Authorization)
    try {
        const result = await new Promise<any>((resolve, reject) => {
            // Use PreAuth initialization endpoint
            if (!iyzipay) {
                return reject(new Error("Payment configuration missing"))
            }
            iyzipay.checkoutFormInitializePreAuth.create(request, (err: any, result: any) => {
                if (err) reject(err)
                else resolve(result)
            })
        })

        if (result.status !== 'success') {
            console.error('Iyzipay Init Error:', result.errorMessage)
            return { error: result.errorMessage }
        }

        console.log("Iyzipay Init Success. Form Content Length:", result.checkoutFormContent?.length)
        return { htmlContent: result.checkoutFormContent }
    } catch (error: unknown) {
        console.error("Iyzipay Exception:", error)
        return { error: "Payment initialization failed." }
    }
}
