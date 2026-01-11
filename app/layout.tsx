import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/privacy/cookie-banner";

const notoSans = Noto_Sans({ variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tripzeo.com"),
  title: {
    default: "Tripzeo | Unique Local Experiences",
    template: "%s | Tripzeo"
  },
  description: "Discover and book unique local experiences, tours, and activities hosted by experts.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tripzeo.com',
    siteName: 'Tripzeo',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Tripzeo Experiences'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tripzeo | Unique Local Experiences',
    description: 'Discover and book unique local experiences, tours, and activities hosted by experts.',
    images: ['/opengraph-image'], // Re-use OG image
  },
  alternates: {
    canonical: './',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Tripzeo",
  "url": process.env.NEXT_PUBLIC_APP_URL || "https://tripzeo.com",
  "logo": "https://tripzeo.com/icon.svg",
  "sameAs": [
    "https://twitter.com/tripzeo",
    "https://instagram.com/tripzeo"
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSans.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
              });
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieBanner />
        <Toaster />
        <SpeedInsights />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-FCW9K3D22J"} />
      </body>
    </html>
  );
}
