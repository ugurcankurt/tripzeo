import { ImageResponse } from 'next/og'


export const alt = 'Search Tripzeo'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f1f1 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f1f1 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        background: 'rgba(255,255,255,0.8)',
                        padding: '40px 80px',
                        borderRadius: 20,
                        border: '1px solid #eaeaea',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }}
                >
                    <div
                        style={{
                            fontSize: 48,
                            fontWeight: 800,
                            letterSpacing: '-0.025em',
                            marginBottom: 10,
                        }}
                    >
                        Find Your Next Adventure
                    </div>
                    <div
                        style={{
                            fontSize: 24,
                            color: '#666',
                        }}
                    >
                        Search thousands of experiences on Tripzeo
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: 0.5
                }}>
                    <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.05em' }}>tripzeo</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
