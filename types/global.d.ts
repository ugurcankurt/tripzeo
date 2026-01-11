export { }

declare global {
    interface Window {
        gtag: (
            command: 'consent' | 'config' | 'event' | 'js',
            targetId: string,
            config?: { [key: string]: any }
        ) => void;
        dataLayer: any[];
    }
}
