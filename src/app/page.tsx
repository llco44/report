'use client'
import Image from 'next/image'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import { useLanguage } from '@/context/language'

export default function HomePage() {
  const { t, lang } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--page-bg)' }}>
      <SiteHeader />
  <div className="hidden md:block fixed top-[60px] -left-[64px] z-0 pointer-events-none">
  <Image
    src="/etarmamyyi.png"
    alt="Frame"
    width={500}
    height={350}
  />
</div>
   <div className="absolute top-20 right-8 z-0 pointer-events-none">
  <Image
    src="/sheww.svg"
    alt="Logo"
    width={150}
    height={70}
  />
</div>

      
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pt-20 pb-10">
      <footer className="fixed bottom-0 left-0 w-full p-4 bg-[var(--page-bg)] z-50 flex justify-between items-end">
  
  {/* جهة اليسار: رشا والصيانة */}
  <div className="text-xs text-[#94a3b8] flex flex-col items-start pl-4">
    <p>إعداد وتصميم مشرفة الصيانة / رشا البلوي</p>
    <p>مركز الصيانة © 2026</p>
  </div>

  {/* جهة اليمين: مركز التأهيل الشامل */}
  <div className="text-sm font-bold text-[#14b8a6] flex flex-col items-end pr-4">
    <p>مركز التأهيل الشامل</p>
    <p>بمكة المكرمة</p>
    <p>قسم الإناث</p>
  </div>

</footer>
        {/* ── Hero ── */}
        <div className="w-full max-w-xl text-center mb-8 sm:mb-14 animate-slide-up">

          <h1 className="text-4xl sm:text-6xl font-black mb-5 leading-tight tracking-tight"
            style={{ color: 'var(--text-1)' }}>
            {t('appName')}
          </h1>

          <p className="text-lg leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-2)' }}>
            {t('homeSubtitle')}
          </p>
        </div>

        {/* ── CTA cards ── */}
        <div className="animate-slide-up delay-100 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-12">

          {/* Primary */}
          <Link href="/report"
            className="group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-all hover:-translate-y-1"
            style={{
              background: '#1d4ed8',
              boxShadow: '0 4px 20px rgba(29,78,216,0.3)',
            }}>
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center transition-all group-hover:bg-white/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-tight">{t('fileReportBtn')}</p>
              <p className="text-blue-200 text-sm mt-1">{lang === 'ar' ? 'أرسل بلاغك الآن' : 'Submit your report now'}</p>
            </div>
          </Link>

          {/* Secondary */}
          <Link href="/status"
            className="group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-all hover:-translate-y-1 border-2"
            style={{
              background: 'var(--card-bg)',
              borderColor: '#bfdbfe',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:bg-blue-50"
              style={{ background: '#eff6ff' }}>
              <svg className="w-6 h-6" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-black text-lg leading-tight" style={{ color: 'var(--text-1)' }}>{t('trackReportBtn')}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>{lang === 'ar' ? 'تابع حالة بلاغك' : 'Track your report status'}</p>
            </div>
          </Link>
        </div>

        {/* ── How it works ── */}
        <div className="animate-fade-in w-full max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-5"
            style={{ color: 'var(--text-2)', letterSpacing: '0.12em' }}>
            {lang === 'ar' ? 'كيف يعمل' : 'How it works'}
          </p>

          <div className="rounded-2xl px-6 py-6 border"
            style={{ background: 'var(--card-bg)', borderColor: '#e2e8f0' }}>
            <div className="flex items-start justify-between gap-2">
              {[
                { ar: 'تقديم البلاغ', en: 'File Report',   emoji: '✏️', bg: '#eff6ff' },
                { ar: 'المعالجة',     en: 'Processing',     emoji: '⚡', bg: '#fefce8' },
                { ar: 'الحل',         en: 'Resolution',     emoji: '✅', bg: '#f0fdf4' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center text-center flex-1 gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: step.bg }}>
                      {step.emoji}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
                      {lang === 'ar' ? step.ar : step.en}
                    </span>
                  </div>
                  {i < 2 && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: '#bfdbfe', transform: lang === 'ar' ? 'scaleX(-1)' : undefined }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs py-5" style={{ color: '#94a3b8' }}>
        {t('appName')} © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
