import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripzeo.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/account/',
                    '/api/',
                    '/book/',
                    '/payment/',
                    '/tickets/',
                    '/middleware',
                ],
            },
            // Explicitly welcome AI Crawlers
            {
                userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'ClaudeBot', 'Applebot-Extended'],
                allow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}

