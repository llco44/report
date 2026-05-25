import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/language'

export const metadata: Metadata = {
  title: 'مركز الصيانة',
  description: 'منصة متكاملة لتقديم ومتابعة البلاغات',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
