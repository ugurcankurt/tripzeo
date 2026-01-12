'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/guards"
import { createNotification } from "@/modules/notifications/actions"

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

        // Notify Host
        await createNotification({
            userId: booking.host_id,
            title: "Payout Processed",
            message: `A payout of ${booking.host_earnings} USD for booking #${bookingId.slice(0, 8)} has been processed.`,
            link: "/vendor/finance",
            type: "success"
        })

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
        const metadata = transaction.metadata as Record<string, unknown>
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

export async function getPartnerPayouts(status: 'pending' | 'completed' = 'pending') {
    const supabase = await createClient()

    // Explicitly cast to match database enum type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusFilter = (status === 'pending' ? ['pending', 'failed'] : ['completed']) as any

    // Fetch pending commission transactions with partner profile details
    const { data: payouts, error } = await supabase
        .from('financial_transactions')
        .select(`
            *,
            partner:profiles!financial_transactions_user_id_fkey(
                id,
                full_name,
                email,
                bank_name,
                account_holder,
                iban,
                bank_code,
                bank_country,
                routing_number,
                account_number
            )
        `)
        .eq('type', 'commission')
        .in('status', statusFilter)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching partner payouts:", error)
        return []
    }

    return payouts
}

export async function markCommissionAsPaid(transactionId: string) {
    const supabase = await createClient()

    // 1. Verify Admin (Optional but good practice if not trusted context)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // 2. Update Transaction Status
    const { data: transaction, error: updateError } = await supabase
        .from('financial_transactions')
        .update({ status: 'completed' }) // Using 'completed' as per enum, effectively 'paid_out' for this context
        .eq('id', transactionId)
        .select()
        .single()

    if (updateError) {
        console.error("Error updating commission status:", updateError)
        return { error: "Failed to update status." }
    }

    // 3. Notify Partner
    if (transaction && transaction.user_id) {
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: transaction.currency || 'USD'
        }).format(Number(transaction.amount))

        await createNotification({
            userId: transaction.user_id,
            title: "Commission Paid",
            message: `Good news! Your commission of ${formattedAmount} has been paid out to your bank account.`,
            link: "/partner", // Partner dashboard
            type: "success"
        })
    }

    revalidatePath('/admin/payouts/partners')
    return { success: true }
}

export async function getPartnerBalances() {
    const supabase = await createClient()

    // Fetch all pending commissions
    const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select(`
            amount,
            currency,
            user_id,
            partner:profiles!financial_transactions_user_id_fkey(
                id,
                full_name,
                email,
                bank_name,
                account_holder,
                iban,
                bank_code,
                bank_country,
                routing_number,
                account_number
            )
        `)
        .eq('type', 'commission')
        .eq('status', 'pending')

    if (error) {
        console.error("Error fetching partner balances:", error)
        return []
    }

    // specific type for the partner profile from the join
    type PartnerProfile = {
        id: string
        full_name: string | null
        email: string
        bank_name: string | null
        account_holder: string | null
        iban: string | null
        bank_code: string | null
        bank_country: string | null
        routing_number: string | null
        account_number: string | null
    }

    // Aggregate by partner
    const balances: Record<string, {
        partner: PartnerProfile
        amount: number
        currency: string
        transactionCount: number
    }> = {}

    transactions.forEach(tx => {
        if (!tx.user_id || !tx.partner) return

        if (!balances[tx.user_id]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const partner = tx.partner as any
            balances[tx.user_id] = {
                partner: partner,
                amount: 0,
                currency: tx.currency || 'USD',
                transactionCount: 0
            }
        }

        balances[tx.user_id].amount += tx.amount
        balances[tx.user_id].transactionCount += 1
    })

    return Object.values(balances).sort((a, b) => b.amount - a.amount)
}

export async function payoutPartner(partnerId: string) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    // 2. Validate Threshold Server-Side
    const { data: transactions, error: fetchError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('user_id', partnerId)
        .eq('type', 'commission')
        .eq('status', 'pending')

    if (fetchError || !transactions) return { error: "Could not fetch balance." }

    const totalBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0)

    if (totalBalance < 150) {
        return { error: `Balance (${totalBalance}) is below the $150 threshold.` }
    }

    // 3. Perform Bulk Update
    const { error: updateError } = await supabase
        .from('financial_transactions')
        .update({ status: 'completed' })
        .eq('user_id', partnerId)
        .eq('type', 'commission')
        .eq('status', 'pending')

    if (updateError) {
        console.error("Bulk payout error:", updateError)
        return { error: "Failed to process payout." }
    }

    // 4. Notify Partner
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(totalBalance)

    await createNotification({
        userId: partnerId,
        title: "Payout Sent",
        message: `Your total balance of ${formattedAmount} has been paid out.`,
        link: "/partner",
        type: "success"
    })

    revalidatePath('/admin/payouts/partners')
    return { success: true }
}
