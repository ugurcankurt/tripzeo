import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://tripzeo.com'

    return {
        rules: {
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
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
