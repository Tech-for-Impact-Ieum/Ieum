import type React from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { BottomNavWrapper } from '../components/BottomNav'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '이음',
  description: 'Tech for Impact 2025F',
  generator: 'team 이음',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body
        // Desktop에서 mobile처럼 보이고 싶으면 sm:max-w-[430px] sm:max-h-[844px] mx-auto 사용
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} h-screen w-screen sm:max-w-[430px] sm:max-h-[844px] mx-auto`}
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
