import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
