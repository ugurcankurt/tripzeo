import crypto from 'crypto';

interface UserData {
    email?: string;
    phone?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string;
    fbc?: string;
    city?: string;
    country?: string;
    zip?: string;
}

interface CustomData {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{ id: string; quantity: number }>;
}

const hashData = (data: string): string => {
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

export const sendServerEvent = async (
    eventName: string,
    eventTime: number,
    userData: UserData,
    customData?: CustomData,
    eventId?: string,
    actionSource: string = 'website'
) => {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

    if (!pixelId || !accessToken || pixelId === 'your_pixel_id_here') {
        console.warn('Meta CAPI: Pixel ID or Access Token is missing. Event skipped.');
        return { success: false, error: 'Missing credentials' };
    }

    const hashedUserData: any = {
        client_ip_address: userData.client_ip_address,
        client_user_agent: userData.client_user_agent,
        fbp: userData.fbp,
        fbc: userData.fbc,
    };

    if (userData.email) hashedUserData.em = hashData(userData.email);
    if (userData.phone) {
        // Meta requires phone numbers to include country code and only digits
        const cleanPhone = userData.phone.replace(/[^0-9]/g, '');
        hashedUserData.ph = hashData(cleanPhone);
    }
    if (userData.city) hashedUserData.ct = hashData(userData.city);
    if (userData.country) hashedUserData.country = hashData(userData.country);
    if (userData.zip) hashedUserData.zp = hashData(userData.zip);

    const event = {
        event_name: eventName,
        event_time: eventTime,
        action_source: actionSource,
        event_id: eventId,
        user_data: hashedUserData,
        custom_data: customData || {},
    };

    const payload = {
        data: [event],
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Meta CAPI Error:', data);
            return { success: false, error: data };
        }

        console.log(`Meta CAPI Success: ${eventName} event sent successfully.`);
        return { success: true, data };
    } catch (error) {
        console.error('Meta CAPI Request Exception:', error);
        return { success: false, error };
    }
};
