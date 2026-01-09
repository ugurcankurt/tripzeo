import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2">
            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex relative flex-col justify-end p-10 text-white dark:border-r bg-zinc-900">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0">
                    <Image
                        src="/tripzeo_auth_image.webp"
                        alt="Travel background"
                        fill
                        sizes="50vw"
                        className="object-cover object-right opacity-60 grayscale-[20%]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                </div>

                {/* Logo on Top Left of Visual Side */}
                <Link href="/" className="absolute top-10 left-10 flex items-center gap-2 text-2xl font-semibold tracking-tighter text-white z-20">
                    <Image
                        src="/tripzeo.svg"
                        alt="tripzeo logo"
                        width={32}
                        height={32}
                        className="w-8 h-8 brightness-0 invert"
                    />
                    tripzeo
                </Link>

                <div className="relative z-20 space-y-4">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &quot;Tripzeo transformed how I explore the world. The local experiences are unmatched and the hosts are incredible.&quot;
                        </p>
                        <footer className="text-sm font-medium opacity-80">Sofia Davis, Travel Enthusiast</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-4 lg:p-8 bg-background h-full relative">
                <Link href="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-1.5 font-semibold text-2xl tracking-tighter text-primary">
                    <Image
                        src="/tripzeo.svg"
                        alt="tripzeo logo"
                        width={28}
                        height={28}
                        className="w-7 h-7"
                    />
                    tripzeo
                </Link>
                <div className="w-full max-w-sm mx-auto space-y-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
