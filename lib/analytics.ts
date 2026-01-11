/* eslint-disable @typescript-eslint/no-explicit-any */



// Analytics Item Type
export interface AnalyticsItem {
    item_id: string;
    item_name: string;
    affiliation?: string;
    coupon?: string;
    currency?: string;
    discount?: number;
    index?: number;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    item_variant?: string;
    location_id?: string;
    price?: number;
    quantity?: number;
}

// 1. View Item List
export const sendViewItemList = (items: AnalyticsItem[], listName: string = 'Search Results') => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'view_item_list', {
            item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
            item_list_name: listName,
            items: items
        });
    }
};

// 2. View Item
export const sendViewItem = (item: AnalyticsItem) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'view_item', {
            currency: item.currency || 'USD',
            value: item.price,
            items: [item]
        });
    }
};

// 2.5 Select Item
export const sendSelectItem = (item: AnalyticsItem) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'select_item', {
            item_list_id: item.item_list_id,
            item_list_name: item.item_list_name,
            items: [item]
        });
    }
};

// 3. Begin Checkout
export const sendBeginCheckout = (items: AnalyticsItem[], value: number, currency: string = 'USD') => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'begin_checkout', {
            currency: currency,
            value: value,
            items: items
        });
    }
};

// 4. Add Payment Info
export const sendAddPaymentInfo = (items: AnalyticsItem[], value: number, currency: string = 'USD', paymentType: string = 'Credit Card') => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'add_payment_info', {
            currency: currency,
            value: value,
            payment_type: paymentType,
            items: items
        });
    }
};

// 5. Purchase
export const sendPurchase = (transactionId: string, value: number, currency: string = 'USD', items: AnalyticsItem[]) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase', {
            transaction_id: transactionId,
            value: value,
            currency: currency,
            tax: 0,
            shipping: 0,
            items: items
        });
    }
};

// Generic Event Helper (Restored for backward compatibility)
export const sendEvent = (action: string, category: string, label: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};
