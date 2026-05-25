'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/language'

interface NavLink {
  href: string
  label: string
}

interface SiteHeaderProps {
  showBack?: boolean
  navLink?: NavLink
}

export default function SiteHeader({ showBack = false, navLink }: SiteHeaderProps) {
  const { t, lang, toggle, isDark, toggleTheme } = useLanguage()

  return (
    <header
      className="px-4 py-3 flex items-center justify-between"
      style={{ background: 'var(--header-bg)', boxShadow: '0 1px 0 rgba(255,255,255,0.08)' }}
    >
      {/* Logo side */}
      <div className="flex items-center gap-2">
        {showBack && (
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white/15 active:bg-white/30 flex items-center justify-center transition-all flex-shrink-0"
            style={{ marginInlineEnd: '2px' }}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ transform: lang === 'ar' ? 'none' : 'scaleX(-1)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        <Link href="/" className="flex items-center group">
          <span className="text-white font-black text-base leading-tight">{t('appName')}</span>
        </Link>
      </div>

      {/* Actions side */}
      <div className="flex items-center gap-1">
        {/* Nav link — visible on all screen sizes */}
        {navLink && (
          <>
            <Link
              href={navLink.href}
              className="inline-flex items-center text-sm font-bold text-white/90 active:text-white px-3 py-2 rounded-xl transition-all active:bg-white/20"
              style={{ border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <span className="hidden sm:inline">{navLink.label}</span>
              {/* Icon-only on very small screens */}
              <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.2)' }} />
          </>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className="w-10 h-10 rounded-xl bg-white/15 active:bg-white/30 flex items-center justify-center transition-all"
        >
          {isDark ? (
            <svg style={{ width: '18px', height: '18px' }} className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="text-white" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Language toggle */}
        <button
          onClick={toggle}
          title={lang === 'ar' ? 'English' : 'العربية'}
          className="w-10 h-10 rounded-xl bg-white/15 active:bg-white/30 flex items-center justify-center transition-all"
        >
          <svg className="text-white" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </button>
      </div>
    </header>
  )
}
