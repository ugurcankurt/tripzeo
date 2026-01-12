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

    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        referralCode: (profile as any).referral_code,
        totalEarnings,
        pendingEarnings,
        conversionCount: conversionCount || 0,
        transactions: transactions || []
    }
}
