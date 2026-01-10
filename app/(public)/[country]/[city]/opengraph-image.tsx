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

    // Ensure absolute URL if it is a relative path (wsrv.nl needs absolute)
    if (bgImage && !bgImage.startsWith('http')) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tripzeo.com'
        bgImage = `${baseUrl}${bgImage.startsWith('/') ? '' : '/'}${bgImage}`
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: '#000',
                    position: 'relative',
                }}
            >
                {/* Background Image */}
                {bgImage ? (
                    <img
                        src={`https://wsrv.nl/?url=${encodeURIComponent(bgImage)}&w=1200&h=630&fit=cover&output=jpg`}
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
                            color: '#F85032', // Primary Brand Color
                            fontSize: 20,
                            fontWeight: 700,
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                    >
                        Explore Not to Miss
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 900,
                            color: 'white',
                            lineHeight: 1,
                            maxWidth: '90%',
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            marginBottom: 20,
                            letterSpacing: '-0.03em',
                        }}
                    >
                        {cityName}
                    </div>

                    {/* Location Subtitle */}
                    <div style={{
                        color: '#e2e8f0',
                        fontSize: 32,
                        fontWeight: 500,
                        marginBottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <span style={{ fontSize: 32 }}>📍</span> {countryName}
                    </div>

                    {/* Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{
                            padding: '16px 40px',
                            background: '#F85032', // Primary Brand Color
                            color: 'white',
                            borderRadius: 100,
                            fontSize: 24,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 30px rgba(248, 80, 50, 0.4)', // Soft glow
                        }}>
                            View Experiences
                        </div>
                    </div>
                </div>

                {/* Top Right Logo */}
                <div style={{ position: 'absolute', top: 60, right: 60, display: 'flex', alignItems: 'center', gap: 14, zIndex: 20 }}>
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="42" height="42" viewBox="228 256 567 514" xmlSpace="preserve">
                        <path fill="white" opacity="1.000000" stroke="none" d="M471.000061,256.659729 C525.999084,256.658356 580.498047,256.656921 634.997070,256.656342 C650.448181,256.656189 665.902283,256.460205 681.349731,256.697540 C724.916748,257.366974 768.155090,289.377594 776.383667,335.906372 C782.598206,371.047150 773.380737,401.467865 748.799072,427.407532 C732.681519,444.415588 716.014832,460.870605 699.546387,477.527832 C675.023865,502.331390 650.739380,527.370056 626.282654,552.238892 C609.984131,568.812073 593.529358,585.231384 577.203369,601.777588 C553.195129,626.109680 529.331665,650.585144 505.233246,674.827332 C484.739685,695.443237 465.732117,717.622742 443.236115,736.139465 C426.378754,750.014832 407.410828,760.108093 385.940033,765.689941 C369.337738,770.006165 352.518127,770.715149 335.974945,768.946167 C310.637939,766.236877 288.846313,755.016479 271.626801,735.638611 C252.866684,714.527039 245.453705,689.645020 247.818527,661.961792 C249.904358,637.544373 259.601410,616.321594 277.101868,598.737244 C292.215912,583.550720 306.776367,567.814453 321.813232,552.549438 C345.622131,528.379333 369.701874,504.476044 393.522705,480.317596 C416.382538,457.133820 438.987976,433.699158 461.839142,410.506744 C478.960175,393.130035 496.779449,376.410858 513.307068,358.494202 C520.475708,350.723114 527.753113,348.179565 537.988831,348.431152 C565.138611,349.098450 592.315613,348.644135 619.481689,348.692688 C621.547058,348.696381 623.778992,348.084534 625.927429,349.700867 C625.235962,352.055084 623.464600,353.561493 621.875488,355.165314 C584.654236,392.731384 547.365723,430.231140 510.215942,467.867767 C486.460022,491.935028 462.945496,516.240295 439.248566,540.365967 C423.508606,556.390747 407.574005,572.224365 391.841217,588.256104 C371.964935,608.510010 352.152161,628.826965 332.420227,649.221497 C323.902130,658.025635 322.189423,670.377625 326.945679,680.013916 C331.935638,690.123718 347.512482,695.633972 357.405151,694.057007 C381.671387,690.188538 399.435028,676.479248 415.772614,659.624390 C436.585052,638.153015 457.676971,616.952698 478.612244,595.600098 C508.750549,564.860901 538.784180,534.018799 568.999084,503.355225 C592.450684,479.555389 616.202209,456.051086 639.649841,432.247345 C657.823364,413.797760 675.925476,395.269714 693.693298,376.431396 C705.822327,363.571533 704.211060,344.100922 687.888123,334.919525 C684.457214,332.989685 680.711487,332.367859 676.887268,332.366852 C571.555908,332.339508 466.223053,332.022308 360.894043,332.519196 C322.058289,332.702423 296.616028,370.008087 307.764221,405.664124 C314.966675,428.700317 336.036621,444.465088 360.671509,444.655060 C373.170502,444.751434 385.671082,444.638275 398.170532,444.698181 C400.049408,444.707184 402.254059,443.978851 403.595978,446.163208 C403.639526,447.932953 402.278137,448.777832 401.249084,449.818481 C387.339111,463.885468 373.555634,478.081238 359.453247,491.952759 C351.999847,499.284088 344.171356,506.271606 337.486664,514.304016 C334.108124,518.363708 330.222015,518.110779 326.324188,516.937561 C306.930023,511.099579 289.049164,502.470337 273.884735,488.609802 C255.078918,471.420898 241.531662,451.117249 234.455109,426.465881 C230.340332,412.131897 227.816437,397.609344 228.839676,382.794312 C229.821091,368.584442 232.497086,354.643585 237.666367,341.144470 C248.414154,313.077606 266.555573,291.370544 292.024841,275.676819 C307.445435,266.174896 324.216278,260.350739 342.116302,257.611664 C346.080780,257.005035 350.006714,256.639740 354.008179,256.642853 C392.838806,256.673065 431.669434,256.660431 471.000061,256.659729 z" />
                    </svg>
                    <div style={{ color: 'white', fontSize: 32, fontWeight: 700, letterSpacing: '-0.05em', opacity: 0.9 }}>tripzeo</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
