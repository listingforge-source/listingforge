import type { Metadata } from "next";
import { Playfair_Display, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ListingForge — AI Product Listings That Sell",
  description:
    "Generate platform-optimized product listings for Shopify, Amazon, Etsy, and eBay in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${manrope.variable} ${ibmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}