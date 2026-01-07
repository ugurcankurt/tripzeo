import crypto from 'crypto';

export class IyzipayClient {
    private apiKey: string;
    private secretKey: string;
    private uri: string;

    constructor() {
        this.apiKey = process.env.IYZIPAY_API_KEY!;
        this.secretKey = process.env.IYZIPAY_SECRET_KEY!;
        this.uri = process.env.IYZIPAY_URI!;
    }

    private generateAuthorization(randomKey: string, uriPath: string, body?: any): string {
        // Iyzico requires price fields to NOT have trailing .00
        // We'll trust the caller to provide clean strings for now as in current actions
        const bodyStr = body ? JSON.stringify(body) : '';
        const dataToHash = randomKey + uriPath + bodyStr;

        const hash = crypto
            .createHmac('sha256', this.secretKey)
            .update(dataToHash)
            .digest('base64');

        const authString = `${this.apiKey}:${randomKey}:${hash}`;
        return `IYZWSv2 ${Buffer.from(authString).toString('base64')}`;
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

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Iyzipay API Error (${path}):`, errorText);
            try {
                return JSON.parse(errorText);
            } catch {
                throw new Error(`Iyzipay API error: ${response.statusText}`);
            }
        }

        return response.json();
    }
}

export const iyzipayClient = new IyzipayClient();
