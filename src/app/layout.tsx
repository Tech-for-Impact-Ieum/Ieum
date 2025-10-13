import type React from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { BottomNavWrapper } from '../components/BottomNav'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '채팅 앱',
  description: 'Modern Korean chat application',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} h-screen w-screen max-w-[430px] max-h-[844px] mx-auto`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <div className="w-full h-full">{children}</div>
        </Suspense>
        <BottomNavWrapper />

        <Analytics />
      </body>
    </html>
  )
}
