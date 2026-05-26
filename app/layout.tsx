import type { Metadata } from 'next'
import { Inter, Audiowide } from 'next/font/google'
import './globals.css'
import AuthWrapper from './components/AuthWrapper'
import ToastProvider from './components/ToastProvider'
import ChunkErrorHandler from './components/ChunkErrorHandler'

const inter = Inter({ subsets: ['latin'] })
const audiowide = Audiowide({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://markzy.ai'),
  title: 'Markzy - AI-Powered Marketing Tools',
  description: 'Transform your marketing with AI-powered tools that generate high-converting content and boost your business growth.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={audiowide.variable}>
      <body className={`${inter.className} m-0 p-0 min-h-screen w-full overflow-x-hidden`}>
        <ChunkErrorHandler />
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <ToastProvider />
      </body>
    </html>
  )
}
