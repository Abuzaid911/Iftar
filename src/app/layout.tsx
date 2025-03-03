import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Iftar Photo Competition',
  description: 'Share and vote for the best Iftar photos!',
  openGraph: {
    title: 'Iftar Photo Competition',
    description: 'Share and vote for the best Iftar photos!',
    images: ['/og-image.jpg'],
    type: 'website',
    locale: 'en_US',
    siteName: 'Iftar Competition',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iftar Photo Competition',
    description: 'Share and vote for the best Iftar photos!',
    images: ['/og-image.jpg'],
    creator: '@yourtwitterhandle',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
