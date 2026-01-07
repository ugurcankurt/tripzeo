import crypto from 'crypto';

export class IyzipayClient {
    private apiKey: string;
    private secretKey: string;
    private uri: string;

    constructor() {
        this.apiKey = (process.env.IYZIPAY_API_KEY || '').trim();
        this.secretKey = (process.env.IYZIPAY_SECRET_KEY || '').trim();
        this.uri = (process.env.IYZIPAY_URI || '').trim().replace(/\/$/, '');

        if (!this.apiKey || !this.secretKey || !this.uri) {
            console.warn('IyzipayClient: Missing environment variables');
        }
    }

    private generateAuthorization(randomKey: string, uriPath: string, body?: any): string {
        const bodyStr = body ? JSON.stringify(body) : '';
        const dataToHash = randomKey + uriPath + bodyStr;

        // IMPORTANT: The official SDK uses hex digest, not base64!
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(dataToHash)
            .digest('hex');

        // Official SDK format: apiKey:[value]&randomKey:[value]&signature:[value]
        const authPayload = `apiKey:${this.apiKey}&randomKey:${randomKey}&signature:${signature}`;
        return `IYZWSv2 ${Buffer.from(authPayload).toString('base64')}`;
    }

    async post(path: string, body: any) {
        const randomKey = crypto.randomBytes(8).toString('hex');
        const authHeader = this.generateAuthorization(randomKey, path, body);

        const response = await fetch(`${this.uri}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'x-iyzi-rnd': randomKey
            },
            body: JSON.stringify(body)
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error(`Iyzipay API HTTP Error (${path}):`, response.status, responseText);
            try {
                return JSON.parse(responseText);
            } catch {
                throw new Error(`Iyzipay API error: ${response.statusText} - ${responseText}`);
            }
        }

        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error('Iyzipay JSON Parse Error:', e, responseText);
            throw new Error(`Invalid JSON response from Iyzipay: ${responseText.substring(0, 100)}`);
        }
    }
}

export const iyzipayClient = new IyzipayClient();
