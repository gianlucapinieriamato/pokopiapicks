import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import Nav from "@/app/components/Nav";
import JsonLd from "@/app/components/JsonLd";
import { AdSlot } from "@/app/components/AdSlot";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/app/lib/config";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · What each Pokemon likes`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · What each Pokemon likes`,
    description: SITE_DESCRIPTION,
    images: [
      { url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · What each Pokemon likes`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1Q3023J5YJ"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1Q3023J5YJ');
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=pub-6028271541011678"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/pokedex/?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <Nav />
        <AdSlot slot="8403578120" format="horizontal" />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <AdSlot slot="2178978334" format="horizontal" />
        <footer className="mt-4 md:mt-12 py-6 border-t border-paper-edge text-center">
          <p className="text-[13px] text-ink-soft">
            Pokopia Picks, fan-made wiki for Pokemon Pokopia.
          </p>
        </footer>
      </body>
    </html>
  );
}
