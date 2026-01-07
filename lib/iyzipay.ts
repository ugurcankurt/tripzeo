import Iyzipay from 'iyzipay'

let iyzipay: Iyzipay | null = null

try {
    if (process.env.IYZIPAY_API_KEY && process.env.IYZIPAY_SECRET_KEY && process.env.IYZIPAY_URI) {
        iyzipay = new Iyzipay({
            apiKey: process.env.IYZIPAY_API_KEY,
            secretKey: process.env.IYZIPAY_SECRET_KEY,
            uri: process.env.IYZIPAY_URI
        })
    } else {
        console.warn('Iyzipay environment variables missing. Payment features will be disabled.')
    }
} catch (error) {
    console.error('Failed to initialize Iyzipay:', error)
}

export default iyzipay
