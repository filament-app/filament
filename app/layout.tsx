import type { Metadata } from 'next'
import { Barlow_Condensed, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Filament — AI Infrastructure Layer',
  description: 'One endpoint. Any model. Full observability. The wire your AI stack runs on.',
  metadataBase: new URL('https://filament.works'),
  openGraph: {
    title: 'Filament — AI Infrastructure Layer',
    description: 'One endpoint. Any model. Full observability.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="font-mono">{children}</body>
    </html>
  )
}
