import Iyzipay from 'iyzipay'

let iyzipay: Iyzipay | null = null
export let initializationError: any = null

try {
    if (process.env.IYZIPAY_API_KEY && process.env.IYZIPAY_SECRET_KEY && process.env.IYZIPAY_URI) {
        iyzipay = new Iyzipay({
            apiKey: process.env.IYZIPAY_API_KEY,
            secretKey: process.env.IYZIPAY_SECRET_KEY,
            uri: process.env.IYZIPAY_URI
        })
    } else {
        console.warn('Iyzipay environment variables missing. Payment features will be disabled.', {
            IYZIPAY_API_KEY: !!process.env.IYZIPAY_API_KEY,
            IYZIPAY_SECRET_KEY: !!process.env.IYZIPAY_SECRET_KEY,
            IYZIPAY_URI: !!process.env.IYZIPAY_URI
        })
    }
} catch (error) {
    console.error('Failed to initialize Iyzipay:', error)
    initializationError = error
}

export default iyzipay
