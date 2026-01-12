'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPartnerData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    // 1. Get Profile (Referral Code + Role)
    const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, role')
        .eq('id', user.id)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (profile as any)?.role

    if (!profile || userRole !== 'partner') {
        return { error: "Unauthorized" }
    }

    // 2. Get Stats
    // Use a single query for transactions if possible, or aggregate
    const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'commission')
        .order('created_at', { ascending: false })

    const totalEarnings = transactions
        ?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // Force cast to avoid TS error about strict enum mismatch
    const pendingEarnings = transactions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.filter(t => (t.status as any) === 'pending')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // Conversions count
    const { count: conversionCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', user.id)

    // Check if bank info is complete (basic check for TR/EU/US common fields)
    // We check if at least bank_name and account_holder are present, 
    // and either iban OR (routing_number AND account_number) is present.
    // Explicit casting to any to access properties safely if typescript complains about nulls, though profile is typed.
    const p = profile as any
    const hasBasicInfo = !!(p.bank_name && p.account_holder)
    const hasIban = !!p.iban
    const hasUSAccount = !!(p.routing_number && p.account_number)

    const isBankInfoComplete = hasBasicInfo && (hasIban || hasUSAccount)

    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        referralCode: (profile as any).referral_code,
        totalEarnings,
        pendingEarnings,
        conversionCount: conversionCount || 0,
        transactions: transactions || [],
        isBankInfoComplete
    }
}
