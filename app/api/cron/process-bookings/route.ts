import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// This is a Route Handler for Vercel Cron
export async function POST(req: NextRequest) {
    // 1. Verify Authentication (CRON_SECRET)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Initialize Admin Supabase Client (Service Role)
        const adminSupabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. Find confirmed bookings that have ended
        const now = new Date();
        const todayStr = now.toISOString();

        // Query: Status is confirmed AND booking_date is in the past
        const { data: bookings, error: fetchError } = await adminSupabase
            .from('bookings')
            .select(`
                id,
                user_id,
                status,
                booking_date,
                experience:experiences (
                    title
                )
            `)
            .eq('status', 'confirmed')
            .lt('booking_date', todayStr);

        if (fetchError) {
            console.error('Error fetching bookings:', fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No bookings to process', processed: 0 });
        }

        // 4. Process Updates
        const updates = bookings.map(async (booking) => {
            // Update status to 'completed'
            const { error: updateError } = await adminSupabase
                .from('bookings')
                .update({ status: 'completed' })
                .eq('id', booking.id);

            if (updateError) {
                console.error(`Failed to complete booking ${booking.id}:`, updateError);
                return null;
            }

            // Send Notification to User manually (since no user session for createNotification)
            const { error: notifError } = await adminSupabase
                .from('notifications')
                .insert({
                    user_id: booking.user_id,
                    title: "How was your trip?",
                    message: `Your experience ${booking.experience?.title || ''} is complete. Please leave a review!`,
                    link: "/account/orders"
                });

            if (notifError) console.error("Failed to send notification:", notifError);

            return booking.id;
        });

        const results = await Promise.all(updates);
        const successful = results.filter((r) => r !== null);

        return NextResponse.json({
            message: 'Bookings processed',
            processed: successful.length,
            total: bookings.length
        });

    } catch (error: any) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
