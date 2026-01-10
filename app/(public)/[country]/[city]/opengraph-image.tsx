import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export const alt = 'City Travel Guide'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { city: string, country: string } }) {
    const { city, country } = await params

    // Helper to format text (slug to title case roughly)
    const formatSlug = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const cityName = decodeURIComponent(formatSlug(city))
    const countryName = decodeURIComponent(formatSlug(country))

    // Initialize Supabase Client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Resolve exact city name from DB if possible using smart query
    // Since we don't have exact name, we use the formatted slug as fallback but try to find a match
    // For OG, perfection isn't strictly necessary, but let's try to get an image for this city.

    // We search for *any* experience in this city (fuzzy match or slug match) to get an image
    // Note: Supabase ILIKE might be expensive or not index friendly without text search, but fine for single edge invocation
    // This query tries to match the city slug against location_city
    // Since we can't reliably unslugify to exact DB string without a map, we just hope 'Istanbul' matches 'istanbul' via ilike.

    // Better strategy for image: Fetch experiences where location_country ilike country AND location_city ilike city
    // We use the decoded slug.
    const { data: experiences } = await supabase
        .from('experiences')
        .select('images')
        .eq('is_active', true)
        .ilike('location_city', cityName) // Hope that "Istanbul" matches "İstanbul" via ilike or simple match
        .not('images', 'is', null)
        .limit(1)

    // Fallback search: just country if no city image
    let bgImage = experiences?.[0]?.images?.[0]

    if (!bgImage) {
        const { data: countryExperiences } = await supabase
            .from('experiences')
            .select('images')
            .eq('is_active', true)
            .ilike('location_country', countryName)
            .not('images', 'is', null)
            .limit(1)
        bgImage = countryExperiences?.[0]?.images?.[0]
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
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
                            background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
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
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        zIndex: 10,
                        padding: '60px 60px',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            color: '#e2e8f0',
                            fontSize: 24,
                            fontWeight: 600,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}
                    >
                        <span style={{ fontSize: 24 }}>📍</span> {countryName}
                    </div>
                    <div
                        style={{
                            color: '#fff',
                            fontSize: 90,
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                            marginBottom: 20,
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        }}
                    >
                        {cityName}
                    </div>
                    <div
                        style={{
                            background: '#fff',
                            color: '#000',
                            fontSize: 26,
                            fontWeight: 700,
                            padding: '12px 24px',
                            borderRadius: 12,
                        }}
                    >
                        Top Things to Do & Tours
                    </div>
                </div>

                {/* Brand */}
                <div style={{ position: 'absolute', top: 60, right: 60, display: 'flex', zIndex: 20 }}>
                    <div style={{ color: 'white', fontSize: 32, fontWeight: 900 }}>tripzeo</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
