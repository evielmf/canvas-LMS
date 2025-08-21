import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { Metadata, Viewport } from 'next'
import { ChunkErrorBoundary } from '@/components/ui/ChunkErrorBoundary'
import CanvasDataDebug from '@/components/debug/CanvasDataDebug'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4C8256',
}

export const metadata: Metadata = {
  title: 'Easeboard - Your Peaceful Study Companion',
  description: 'A calming, student-friendly Canvas dashboard designed to reduce stress and promote mindful learning',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Easeboard',
  },
  other: {
    'apple-mobile-web-app-title': 'Easeboard',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional PWA meta tags not covered by metadata */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ChunkErrorBoundary>
          <Providers>
            {children}
            <CanvasDataDebug />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgb(76, 130, 86)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 16px rgba(87, 83, 78, 0.12), 0 2px 8px rgba(87, 83, 78, 0.08)',
                },
                success: {
                  style: {
                    background: 'rgb(107, 161, 115)',
                  },
                },
                error: {
                  style: {
                    background: 'rgb(220, 38, 38)',
                  },
                },
              }}
            />
          </Providers>
        </ChunkErrorBoundary>
      </body>
    </html>
  )
}
