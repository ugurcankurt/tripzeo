'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/guards"

export async function processPayout(bookingId: string, receiptUrl?: string) {
    try {
        const { user, profile } = await requireAuth()

        if (!profile || profile.role !== 'admin') {
            return { error: "Unauthorized" }
        }

        const supabase = await createClient()

        // 1. Get booking details to verify amount and host
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*, host:profiles!bookings_host_id_fkey(bank_name, account_holder, iban)')
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
            console.error("Booking Fetch Error:", bookingError)
            return { error: "Booking not found" }
        }

        if (booking.status === 'paid_out') {
            return { error: "Already paid out" }
        }

        // 2. Create Financial Transaction Record
        // We record that we sent money TO the host (Payout)
        const { data: transaction, error: txError } = await supabase
            .from('financial_transactions')
            .insert({
                booking_id: bookingId,
                user_id: booking.host_id, // The host receiving the money
                amount: booking.host_earnings,
                currency: 'USD', // Default currency as per schema
                type: 'payout',
                status: 'completed', // Assuming manual payout is immediate/verified
                description: `Payout for booking #${bookingId.slice(0, 8)}`,
                metadata: {
                    processed_by: user.id,
                    method: 'manual_bank_transfer', // Or dynamic if we had integration
                    host_bank_name: booking.host?.bank_name,
                    host_account_holder: booking.host?.account_holder,
                    host_iban: booking.host?.iban,
                    receipt_url: receiptUrl // Store the manual receipt URL
                }
            })
            .select()
            .single()

        if (txError) {
            console.error("Transaction Creation Error:", txError)
            return { error: "Failed to create transaction record" }
        }

        // 3. Update Booking Status
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'paid_out',
                payment_id: transaction.id // Store reference to internal transaction ID as payment_id for receipt
            })
            .eq('id', bookingId)

        if (updateError) {
            console.error("Booking Update Error:", updateError)
            return { error: "Failed to update booking status" }
        }

        revalidatePath('/admin/payouts')
        return { success: true }

    } catch (error) {
        console.error("Process Payout Error:", error)
        return { error: "Internal Server Error" }
    }
}

export async function fetchReceiptData(transferId: string) {
    try {
        const supabase = await createClient()

        // Fetch transaction details
        // We use transferId as the ID from financial_transactions table
        const { data: transaction, error } = await supabase
            .from('financial_transactions')
            .select('*, user:user_id(full_name)')
            .eq('id', transferId)
            .single()

        if (error || !transaction) {
            // Fallback: Check if it's a booking payment_id (legacy or iyzipay ID)
            // But for manual payouts, we inserted transaction.id into booking.payment_id
            return { error: "Receipt not found" }
        }

        // Check for manual receipt URL in metadata
        const metadata = transaction.metadata as any
        const receiptUrl = metadata?.receipt_url

        return {
            data: {
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                created: transaction.created_at,
                processorName: "Tripzeo Platform (Manual)",
                bankingPartnerReference: transaction.id,
                mt103: `REF-${transaction.id.slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`,
                receiptUrl: receiptUrl // Pass the URL to the frontend
            }
        }

    } catch (error) {
        console.error("Fetch Receipt Error:", error)
        return { error: "Failed to fetch receipt" }
    }
}
