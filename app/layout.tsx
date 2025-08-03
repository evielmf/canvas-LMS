import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Easeboard - Your Peaceful Study Companion',
  description: 'A calming, student-friendly Canvas dashboard designed to reduce stress and promote mindful learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
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
      </body>
    </html>
  )
}
