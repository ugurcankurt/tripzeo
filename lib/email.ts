
import { Resend } from 'resend';
import { NotificationEmail } from '@/components/emails/notification-email';
import { BookingConfirmedEmail } from '@/components/emails/booking-confirmed-email';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendNotificationEmail(
    to: string,
    props: {
        title: string;
        message: string;
        link?: string | null;
        userName?: string | null;
    }
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email sending skipped.');
        return { success: false, error: 'Missing API Key' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: `TripZeo Notification: ${props.title}`,
            react: NotificationEmail(props),
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception sending email:', error);
        return { success: false, error };
    }
}

export async function sendBookingConfirmedEmail(
    to: string,
    props: {
        userName: string;
        experienceTitle: string;
        bookingDate: string;
        startTime: string;
        guests: number;
        location: string;
        bookingId: string;
        price: string;
        hostName: string;
        hostEmail: string;
        hostPhone: string;
    }
) {
    if (!process.env.RESEND_API_KEY) return;

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: `Booking Confirmed: ${props.experienceTitle}`,
            react: BookingConfirmedEmail(props),
        });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}
