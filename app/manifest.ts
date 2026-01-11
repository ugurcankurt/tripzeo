import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Tripzeo',
        short_name: 'Tripzeo',
        description: 'Discover and book unique local experiences, tours, and activities hosted by experts.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF4F30', // Brand Red-Orange (Approximation of oklch(0.646 0.222 41.116))
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
