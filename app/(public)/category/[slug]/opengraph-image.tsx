import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

// Use Edge runtime for better performance and to avoid Node.js serverless limitations on Vercel
export const runtime = 'edge'

export const alt = 'Category Experiences'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // Log start of generation
    console.log(`[OG Start] Generating image for category: ${slug}`)

    try {
        // Initialize Supabase Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error('[OG Error] Missing Supabase Env Vars')
            // Don't throw to avoid 500, just fallback
        }

        let categoryName = 'Experiences'
        let bgImageBuffer: ArrayBuffer | null = null

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey)

            // 1. Fetch Category
            const { data: category, error: catError } = await supabase
                .from('categories')
                .select('name, icon')
                .eq('slug', slug)
                .single()

            if (catError) {
                console.error('[OG Error] Category fetch failed:', catError)
            }

            if (category?.name) {
                categoryName = category.name
                console.log(`[OG Info] Found category: ${categoryName}`)
            }

            // 2. Fetch recent experiences (top 5 to find one with image)
            const { data: experiences, error: expError } = await supabase
                .from('experiences')
                .select('images')
                .eq('is_active', true)
                .eq('category', categoryName)
                .not('images', 'is', null)
                .order('created_at', { ascending: false })
                .limit(5)

            if (expError) {
                console.error('[OG Error] Experiences fetch failed:', expError)
            }

            const validExperience = experiences?.find((exp: any) => exp.images && exp.images.length > 0 && typeof exp.images[0] === 'string')
            const rawBgImage = validExperience?.images?.[0]

            // Helper to get absolute URL
            const getAbsoluteUrl = (path?: string | null) => {
                if (!path) return null
                if (path.startsWith('http')) return path
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tripzeo.com'
                return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
            }

            const bgImageUrl = getAbsoluteUrl(rawBgImage)
            console.log(`[OG Info] Background Image URL: ${bgImageUrl || 'None'}`)

            // 3. Fetch Image Buffer with Robust Proxy
            if (bgImageUrl) {
                try {
                    // Use wsrv.nl (formerly images.weserv.nl) as a robust proxy to:
                    // 1. Convert WebP (or any format) to JPEG
                    // 2. Resize efficiently
                    // 3. Ensure CORS and valid headers
                    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(bgImageUrl)}&w=1200&h=630&fit=cover&output=jpg&q=80`
                    console.log(`[OG Info] Using Proxy URL: ${proxyUrl}`)

                    // Try to fetch the image
                    const controller = new AbortController()
                    const timeoutId = setTimeout(() => controller.abort(), 4000) // 4s timeout

                    const res = await fetch(proxyUrl, { signal: controller.signal })
                    clearTimeout(timeoutId)

                    if (res.ok) {
                        bgImageBuffer = await res.arrayBuffer()
                    } else {
                        console.error(`[OG Error] Proxy failed: ${res.status} ${res.statusText}`)
                        // Fallback attempt: Try original URL directly if it's not WebP (optimistic check)
                        if (!bgImageUrl.toLowerCase().endsWith('.webp')) {
                            console.log('[OG Info] Proxy failed, trying original URL...')
                            const fallbackRes = await fetch(bgImageUrl)
                            if (fallbackRes.ok) bgImageBuffer = await fallbackRes.arrayBuffer()
                        }
                    }
                } catch (fetchError) {
                    console.error('[OG Error] Image fetch threw:', fetchError)
                }
            }
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#000',
                        position: 'relative',
                    }}
                >
                    {/* Full Background Image */}
                    {bgImageBuffer ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={bgImageBuffer as any}
                            alt=""
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #e64d12 0%, #c2410c 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: 100, fontWeight: 900 }}>TRIPZEO</div>
                        </div>
                    )}

                    {/* Dark Gradient Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 100%)',
                        }}
                    />

                    {/* Content Container */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            width: '100%',
                            height: '100%',
                            padding: 60,
                            zIndex: 10,
                        }}
                    >
                        {/* Label */}
                        <div
                            style={{
                                color: '#e2e8f0',
                                fontSize: 24,
                                fontWeight: 600,
                                marginBottom: 16,
                                display: 'flex',
                                alignItems: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            Explore
                        </div>

                        {/* Title */}
                        <div
                            style={{
                                fontSize: 70,
                                fontWeight: 800,
                                color: 'white',
                                lineHeight: 1.1,
                                maxWidth: '90%',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                marginBottom: 30,
                            }}
                        >
                            {categoryName}
                        </div>

                        {/* Subtitle / Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{
                                padding: '12px 30px',
                                background: 'white',
                                color: 'black',
                                borderRadius: 100,
                                fontSize: 24,
                                fontWeight: 700
                            }}>
                                View Experiences
                            </div>
                        </div>
                    </div>

                    {/* Top Right Logo */}
                    <div style={{ position: 'absolute', top: 60, right: 60, display: 'flex', zIndex: 20 }}>
                        <div style={{ color: 'white', fontSize: 32, fontWeight: 900, opacity: 0.9 }}>tripzeo</div>
                    </div>
                </div>
            ),
            {
                ...size,
            }
        )
    } catch (e: any) {
        console.error('OG Generation Error:', e)
        // Fallback Response to avoid 500 error
        return new ImageResponse(
            (
                <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 40, color: 'white' }}>TRIPZEO</div>
                </div>
            ),
            { ...size }
        )
    }
}
