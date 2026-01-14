import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'


export const alt = 'Experience Details'
export const size = {
    width: 1200,
    height: 675,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ country: string, city: string, slug: string }> }) {
    const { slug } = await params
    const experienceId = slug.slice(-36) // Extract ID from slug

    // Initialize Supabase Client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch Experience Details
    const { data: experience } = await supabase
        .from('experiences')
        .select(`
            title,
            price,
            currency,
            images,
            location_city,
            location_country,
            host:profiles(full_name, avatar_url)
        `)
        .eq('id', experienceId)
        .single()

    let bgImage = experience?.images?.[0]
    const title = experience?.title || 'Amazing Experience'
    const price = experience?.price ? `$${experience.price}` : 'Book Now'
    // @ts-ignore
    const hostName = experience?.host?.full_name
    // @ts-ignore
    let hostAvatar = experience?.host?.avatar_url
    const location = experience?.location_city ? `${experience.location_city}, ${experience.location_country}` : ''

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tripzeo.com'

    // Ensure absolute URL and Apply Proxy for Background
    if (bgImage) {
        if (!bgImage.startsWith('http')) {
            bgImage = `${baseUrl}${bgImage.startsWith('/') ? '' : '/'}${bgImage}`
        }
        bgImage = `https://wsrv.nl/?url=${encodeURIComponent(bgImage)}&w=1200&h=675&fit=cover&output=jpg&q=80`
    }

    // Ensure absolute URL and Apply Proxy for Avatar
    if (hostAvatar) {
        if (!hostAvatar.startsWith('http')) {
            hostAvatar = `${baseUrl}${hostAvatar.startsWith('/') ? '' : '/'}${hostAvatar}`
        }
        hostAvatar = `https://wsrv.nl/?url=${encodeURIComponent(hostAvatar)}&w=100&h=100&fit=cover&output=jpg&mask=circle`
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
                {bgImage && (
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
                )}

                {/* Dark Gradient Overlay for text readability */}
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
                    {/* Location Badge */}
                    {location && (
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
                            📍 {location}
                        </div>
                    )}

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
                        {title}
                    </div>

                    {/* Footer Row: Host & Price */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                        {/* Host Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {hostAvatar ? (
                                <img
                                    src={hostAvatar}
                                    width="80"
                                    height="80"
                                    style={{ borderRadius: 100, border: '4px solid rgba(255,255,255,0.2)' }}
                                />
                            ) : (
                                <div style={{ width: 80, height: 80, borderRadius: 100, background: '#333', border: '4px solid rgba(255,255,255,0.2)' }} />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#aaa', fontSize: 20, fontWeight: 500 }}>Hosted by</span>
                                <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{hostName || 'Tripzeo Host'}</span>
                            </div>
                        </div>

                        {/* Price Tag */}
                        <div
                            style={{
                                background: 'white',
                                color: 'black',
                                padding: '16px 40px',
                                borderRadius: 100,
                                fontSize: 40,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            }}
                        >
                            {price}
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
}
