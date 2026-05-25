'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/language'
import { useEffect, useState } from 'react'

const NAV_ITEMS_CONFIG = [
  {
    key: 'dashboard' as const,
    href: '/admin',
    labelKey: 'dashboardTitle' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: 'reports' as const,
    href: '/admin/reports',
    labelKey: 'reports' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: 'statuses' as const,
    href: '/admin/statuses',
    labelKey: 'statuses' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    key: 'questions' as const,
    href: '/admin/questions',
    labelKey: 'questions' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode
  adminName: string
}) {
  const { t, lang, toggle } = useLanguage()
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    function fetchUnread() {
      fetch('/api/notifications').then(r => r.json()).then(d => setUnread(d.unread ?? 0)).catch(() => {})
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 30000)
    return () => clearInterval(id)
  }, [])

  async function markRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setUnread(0)
  }

  const navItems = NAV_ITEMS_CONFIG.map(item => ({
    ...item,
    label: t(item.labelKey),
  }))

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white"
        style={{ borderInlineEnd: '1px solid #e2e8f0' }}>

        {/* Brand */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="flex items-center gap-3">
            <div>
              <p className="font-black text-gray-900 text-sm leading-tight">{t('appName')}</p>
              <p className="text-blue-500 text-xs font-medium mt-0.5">Admin Panel</p>
            </div>
          </div>

          {/* Admin chip */}
          <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {adminName.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{adminName}</p>
              <p className="text-xs text-gray-400">{lang === 'ar' ? 'مدير النظام' : 'Administrator'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const active = isActive(item.href)
            const showBadge = item.href === '/admin/reports' && unread > 0
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (item.href === '/admin/reports') markRead() }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                }`}
              >
                <span className={`relative ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.icon}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center leading-none" style={{ fontSize: '9px' }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </span>
                {item.label}
                {active && !showBadge && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-blue-500" />}
                {showBadge && <span className="ms-auto text-xs font-black text-white bg-red-500 px-1.5 py-0.5 rounded-full">{unread > 9 ? '9+' : unread}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-0.5" style={{ borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-800 hover:bg-slate-100 transition-all font-medium"
          >
            <svg style={{ width: '18px', height: '18px' }} className="flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-800 hover:bg-slate-100 transition-all font-medium"
          >
            <svg className="text-gray-400 flex-shrink-0" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t('home')}
          </Link>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="lg:hidden px-4 py-3 bg-white flex items-center justify-between"
          style={{ borderBottom: '1px solid #e2e8f0' }}>
          <span className="font-black text-gray-900 text-sm">{t('appName')}</span>
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className="w-9 h-9 rounded-xl bg-slate-100 active:bg-slate-200 flex items-center justify-center transition-colors text-gray-500">
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>
            <Link href="/"
              className="w-9 h-9 rounded-xl bg-slate-100 active:bg-slate-200 flex items-center justify-center transition-colors text-gray-500">
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for the tab bar */}
        <main className="flex-1 overflow-auto p-4 pb-24 lg:pb-8 lg:p-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar (hidden lg+) ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white z-40 flex"
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}>
        {navItems.map(item => {
          const active = isActive(item.href)
          const showBadge = item.href === '/admin/reports' && unread > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { if (item.href === '/admin/reports') markRead() }}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors active:bg-blue-50/50"
              style={{ minHeight: '56px' }}
            >
              <span className="relative" style={{ color: active ? '#1d4ed8' : '#94a3b8' }}>
                {item.icon}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-black flex items-center justify-center" style={{ fontSize: '9px' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
              <span className="font-semibold leading-tight"
                style={{ color: active ? '#1d4ed8' : '#94a3b8', fontSize: '10px' }}>
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 inset-x-0 h-0.5 rounded-b"
                  style={{ background: '#1d4ed8', width: '40%', margin: '0 auto' }} />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
