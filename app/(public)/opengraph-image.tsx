import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Tripzeo - Discover Unique Experiences'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    // We can eventually load a custom font here
    // const interSemiBold = fetch(new URL('../../assets/font.ttf', import.meta.url)).then((res) => res.arrayBuffer())

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}
                >
                    {/* Logo Placeholder */}
                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 900,
                            letterSpacing: '-0.05em',
                            background: 'linear-gradient(to right, #fff, #888)',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        tripzeo
                    </div>
                </div>
                <div
                    style={{
                        fontSize: 32,
                        fontWeight: 400,
                        opacity: 0.8,
                        maxWidth: 800,
                        textAlign: 'center',
                    }}
                >
                    Discover unique local experiences, tours, and activities.
                </div>
            </div>
        ),
        {
            ...size,
            // fonts: [
            //   {
            //     name: 'Inter',
            //     data: await interSemiBold,
            //     style: 'normal',
            //     weight: 400,
            //   },
            // ],
        }
    )
}
