import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import JsonLd from "@/app/components/JsonLd";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/app/lib/config";

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
    siteName: SITE_NAME,
    title: `${SITE_NAME} · What each Pokemon likes`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE_NAME }],
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
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/pokedex?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">
          {children}
        </main>
        <footer className="text-center py-6 px-5 font-mono text-[10px] text-ink-fade tracking-[0.04em] font-medium border-t border-paper-edge bg-chrome">
          Pokopia Picks
        </footer>
      </body>
    </html>
  );
}
