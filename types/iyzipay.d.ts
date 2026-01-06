/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'iyzipay' {
    export interface IyzipayConfig {
        apiKey: string;
        secretKey: string;
        uri: string;
    }

    export interface Buyer {
        id: string;
        name: string;
        surname: string;
        gsmNumber: string;
        email: string;
        identityNumber: string;
        lastLoginDate?: string;
        registrationDate?: string;
        registrationAddress: string;
        ip: string;
        city: string;
        country: string;
        zipCode: string;
    }

    export interface Address {
        contactName: string;
        city: string;
        country: string;
        address: string;
        zipCode: string;
    }

    export interface BasketItem {
        id: string;
        name: string;
        category1: string;
        category2?: string;
        itemType: string;
        price: string;
    }

    export interface CreateCheckoutFormInitializeRequest {
        locale: string;
        conversationId: string;
        price: string;
        paidPrice: string;
        currency: string;
        basketId: string;
        paymentGroup: string;
        callbackUrl: string;
        enabledInstallments: number[];
        buyer: Buyer;
        shippingAddress: Address;
        billingAddress: Address;
        basketItems: BasketItem[];
    }

    export default class Iyzipay {
        constructor(config: IyzipayConfig);

        static LOCALE: {
            TR: string;
            EN: string;
        }

        static PAYMENT_GROUP: {
            PRODUCT: string;
            LISTING: string;
            SUBSCRIPTION: string;
        }

        static BASKET_ITEM_TYPE: {
            PHYSICAL: string;
            VIRTUAL: string;
        }

        static PAYMENT_CHANNEL: {
            MOBILE: string;
            WEB: string;
            MOBILE_WEB: string;
        }

        checkoutFormInitialize: {
            create(request: CreateCheckoutFormInitializeRequest, callback: (err: any, result: any) => void): void;
        }

        checkoutFormInitializePreAuth: {
            create(request: CreateCheckoutFormInitializeRequest, callback: (err: any, result: any) => void): void;
        }

        checkoutForm: {
            retrieve(request: any, callback: (err: any, result: any) => void): void;
        }

        approval: {
            create(request: any, callback: (err: any, result: any) => void): void;
        }

        paymentPostAuth: {
            create(request: any, callback: (err: any, result: any) => void): void;
        }

        cancel: {
            create(request: any, callback: (err: any, result: any) => void): void;
        }

        refund: {
            create(request: any, callback: (err: any, result: any) => void): void;
        }
    }
}
