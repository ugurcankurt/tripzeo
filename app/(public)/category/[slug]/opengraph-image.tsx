import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export const alt = 'Category Experiences'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // Initialize Supabase Client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Fetch Category
    const { data: category } = await supabase
        .from('categories')
        .select('name, icon')
        .eq('slug', slug)
        .single()

    const categoryName = category?.name || 'Experiences'

    // 2. Fetch recent experiences (Find one with a valid image)
    const { data: experiences } = await supabase
        .from('experiences')
        .select('images')
        .eq('is_active', true)
        .eq('category', categoryName)
        .not('images', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5)

    const validExperience = experiences?.find((exp: any) => exp.images && exp.images.length > 0 && typeof exp.images[0] === 'string')
    let rawBgImage = validExperience?.images?.[0]

    // Ensure absolute URL if it is a relative path (wsrv.nl needs absolute)
    if (rawBgImage && !rawBgImage.startsWith('http')) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tripzeo.com'
        rawBgImage = `${baseUrl}${rawBgImage.startsWith('/') ? '' : '/'}${rawBgImage}`
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
                {rawBgImage && (
                    <img
                        src={`https://wsrv.nl/?url=${encodeURIComponent(rawBgImage)}&w=1200&h=630&fit=cover&output=jpg`}
                        alt=""
                        width="1200"
                        height="630"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
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
                <div style={{ position: 'absolute', top: 60, right: 60, display: 'flex', alignItems: 'center', gap: 12, zIndex: 20 }}>
                    <img
                        src={`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.tripzeo.com'}/tripzeo.svg`}
                        alt="Tripzeo Logo"
                        width="50"
                        height="50"
                    />
                    <div style={{ color: 'white', fontSize: 32, fontWeight: 900, opacity: 0.9 }}>tripzeo</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
