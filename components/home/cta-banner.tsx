import Image from "next/image"

export function CTABanner() {
  return (
    <section className="relative w-full mb-16 md:pt-0">
      <div className="relative w-full group min-h-[220px] md:min-h-[340px] lg:min-h-[260px] flex items-center">

        {/* Background Container - Clipped & Rounded */}
        <div className="absolute inset-0 rounded-4xl overflow-hidden shadow-xl z-0">
          <Image
            src="/cta_bg_v3.png"
            alt="Wellness and travel experiences"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          {/* Hero Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10" />
        </div>

        {/* Mascot Image - Right Side, Oversized/Pop-out */}
        <div className="absolute right-2 bottom-15 z-20 w-[32%] md:w-[35%] lg:w-[27%] h-[120%] pointer-events-none flex items-end justify-end">
          <div className="relative w-full h-full">
            <Image
              src="/tripzeo-karakter/tripzeo_massage_therapist_character.png"
              alt="Tripzeo Character"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
              className="object-contain object-bottom drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Content - Left Side */}
        <div className="relative z-20 mr-auto w-full md:w-1/2 px-6 md:px-12 lg:px-16 flex flex-col text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Expert services, wherever you go.
          </h2>
          <p className="text-white/90 text-lg mb-0 max-w-md">
            From beauty & wellness to unique local experiences.
          </p>
        </div>

      </div>
    </section>
  )
}
