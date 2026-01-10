import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export const alt = 'Host Profile'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
    const { slug } = await params
    // Assuming slug format: name-id, extract last part as ID. 
    // If simply ID, this still works if no hyphen.
    // Ideally we should use regex or consistent logic.
    const parts = slug.split('-')
    const hostId = parts[parts.length - 1] // Last part is ID

    // Initialize Supabase Client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, bio, category_id, categories(name)')
        .eq('id', hostId)
        .single()

    const name = profile?.full_name || 'Tripzeo Host'
    const bio = profile?.bio ? profile.bio.slice(0, 100) + (profile.bio.length > 100 ? '...' : '') : 'Experiences Host on Tripzeo'
    const avatar = profile?.avatar_url
    // @ts-ignore
    const category = profile?.categories?.name || 'Local Expert'

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    background: 'white',
                }}
            >
                {/* Left Side: Photo/Color */}
                <div
                    style={{
                        flex: '1',
                        background: '#111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'radial-gradient(circle at top right, #333 0%, #000 100%)'
                        }}
                    />

                    {avatar ? (
                        <img
                            src={avatar}
                            style={{
                                width: '300px',
                                height: '300px',
                                borderRadius: 1000,
                                objectFit: 'cover',
                                border: '10px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '300px',
                                height: '300px',
                                borderRadius: 1000,
                                background: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#555',
                                fontSize: 100,
                                fontWeight: 900
                            }}
                        >
                            {name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Right Side: Info */}
                <div
                    style={{
                        flex: '1.2',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: 80,
                        background: '#fff'
                    }}
                >
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: 24,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: 20
                        }}
                    >
                        {category}
                    </div>

                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 900,
                            color: '#0f172a',
                            lineHeight: 1.1,
                            marginBottom: 30,
                        }}
                    >
                        {name}
                    </div>

                    <div
                        style={{
                            fontSize: 28,
                            color: '#475569',
                            lineHeight: 1.5,
                        }}
                    >
                        &ldquo;{bio}&rdquo;
                    </div>

                    <div
                        style={{
                            marginTop: 60,
                            display: 'flex',
                            alignItems: ' center',
                            gap: 15
                        }}
                    >
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#000' }}>tripzeo</div>
                        <div style={{ height: 4, width: 4, background: '#000', borderRadius: 10 }}></div>
                        <div style={{ fontSize: 20, color: '#666' }}>Verified Host</div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
