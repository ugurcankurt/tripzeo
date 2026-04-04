import { GoogleAdsApi } from 'google-ads-api'

if (!process.env.GOOGLE_ADS_CLIENT_ID || 
    !(process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.CLIENT_SECRET) || 
    !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    console.warn("Google Ads API credentials are not fully configured in environment variables.")
}

export const googleAdsClient = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.CLIENT_SECRET || '',
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
})

/**
 * Gets a Customer instance for a specific customer ID and refresh token.
 * Default values are taken from environment variables if not provided.
 */
export const getGoogleAdsCustomer = (
    customerId: string = process.env.GOOGLE_ADS_CUSTOMER_ID || '',
    refreshToken: string = process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    loginCustomerId: string = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || ''
) => {
    if (!customerId || !refreshToken) {
        throw new Error("Google Ads Customer ID or Refresh Token is missing.")
    }
    
    // The library expects customer_id without dashes for some operations, 
    // but the Customer constructor handles it.
    return googleAdsClient.Customer({
        customer_id: customerId.replace(/-/g, ''),
        refresh_token: refreshToken,
        login_customer_id: loginCustomerId ? loginCustomerId.replace(/-/g, '') : undefined,
    })
}
