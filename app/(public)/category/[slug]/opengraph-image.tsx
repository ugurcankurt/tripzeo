import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export const alt = 'Category Experiences'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // Initialize Supabase Client directly (Edge compatible)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Fetch Category Name and Icon
    const { data: category } = await supabase
        .from('categories')
        .select('name, icon')
        .eq('slug', slug)
        .single()

    // Helper to ensure absolute URLs
    const getAbsoluteUrl = (path?: string | null) => {
        if (!path) return null
        if (path.startsWith('http')) return path
        // Use processing NEXT_PUBLIC_APP_URL or fall back to verified domain
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tripzeo.com'
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
    }

    const categoryName = category?.name || 'Experiences'
    // Ensure icon is absolute URL
    const categoryIcon = getAbsoluteUrl(category?.icon)

    // 2. Fetch a representative background image
    // Switching to created_at to ensure we get *any* valid recent image if ratings are empty
    const { data: experiences } = await supabase
        .from('experiences')
        .select('images')
        .eq('is_active', true)
        .eq('category', categoryName)
        .not('images', 'is', null)
        .order('created_at', { ascending: false }) // Match page.tsx logic
        .limit(1)

    // Strategy: Experience Image -> Category Icon -> Fallback Gradient
    // Ensure experience image is absolute
    const rawBgImage = experiences?.[0]?.images?.[0]
    const bgImage = getAbsoluteUrl(rawBgImage) || categoryIcon

    console.log(`OpenGraph Debug [${slug}]:`, { categoryName, bgImage, rawBgImage, categoryIcon })


    // Gradient overlay to ensure text readability
    const overlayGradient = 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))'

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    background: '#1a1a1a',
                    position: 'relative',
                }}
            >
                {/* Background Image */}
                {bgImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={bgImage}
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
                            background: 'linear-gradient(135deg, #e64d12 0%, #c2410c 100%)', // Brand Primary Gradient
                        }}
                    />
                )}

                {/* Gradient Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: overlayGradient,
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        paddingBottom: 80,
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            color: '#fff',
                            fontSize: 24,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600,
                            marginBottom: 10,
                            background: 'rgba(255,255,255,0.2)',
                            padding: '8px 16px',
                            borderRadius: 100,
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        Explore
                    </div>
                    <div
                        style={{
                            color: '#fff',
                            fontSize: 80,
                            fontWeight: 900,
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                            textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        }}
                    >
                        {categoryName}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 30, marginTop: 20, fontWeight: 500 }}>
                        Tripzeo - Local Experiences & Tours
                    </div>
                </div>

                {/* Logo mark bottom right */}
                <div style={{ position: 'absolute', bottom: 40, right: 40, display: 'flex', zIndex: 20 }}>
                    <div style={{ color: 'white', fontSize: 32, fontWeight: 900 }}>tripzeo</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
