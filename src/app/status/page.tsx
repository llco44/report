'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import SiteHeader from '@/components/SiteHeader'
import type { Report, ReportStatusHistory } from '@/lib/types'
import type { TranslationKey } from '@/context/language'

export default function StatusPage() {
  const { t, lang } = useLanguage()
  const [phone, setPhone] = useState('')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setSearched(false)
    const res = await fetch(`/api/phone?phone=${encodeURIComponent(phone.trim())}`)
    if (res.ok) setReports((await res.json()) ?? [])
    setSearched(true)
    setLoading(false)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>

      <SiteHeader showBack navLink={{ href: '/report', label: t('fileReport') }} />

      <main className="max-w-xl mx-auto px-4 py-6 sm:py-10 space-y-5">

        {/* Search card */}
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-1)' }}>{t('statusTitle')}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
            {lang === 'ar' ? 'أدخل رقم هاتفك لتتبع بلاغاتك' : 'Enter your phone number to track reports'}
          </p>

          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: '#e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="h-1" style={{ background: '#1d4ed8' }} />
            <form onSubmit={handleSearch} className="p-5">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ [lang === 'ar' ? 'right' : 'left']: '14px' }}>
                    <svg className="w-4.5 h-4.5 text-gray-400" style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="field-input"
                    style={{ paddingRight: lang === 'ar' ? '44px' : '16px', paddingLeft: lang === 'ar' ? '16px' : '44px' }}
                    dir="ltr"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="text-white font-bold px-6 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 whitespace-nowrap flex items-center gap-2 text-sm"
                  style={{ background: '#1d4ed8', boxShadow: '0 4px 12px rgba(29,78,216,0.3)' }}>
                  {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {loading ? t('searching') : t('searchBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results */}
        {searched && reports.length === 0 && (
          <div className="rounded-2xl border p-10 text-center"
            style={{ background: 'var(--card-bg)', borderColor: '#e2e8f0' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#eff6ff' }}>
              <svg className="w-7 h-7" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-2)' }}>{t('noReports')}</p>
          </div>
        )}

        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} lang={lang} t={t} formatDate={formatDate} />
          ))}
        </div>
      </main>
    </div>
  )
}

function ReportCard({ report, lang, t, formatDate }: {
  report: Report; lang: string
  t: (k: TranslationKey) => string
  formatDate: (d: string) => string
}) {
  const [open, setOpen] = useState(false)
  const statusColor = report.status?.color ?? '#6B7280'
  const statusName = report.status
    ? (lang === 'ar' ? report.status.name_ar : report.status.name_en)
    : t('noStatus')

  return (
    <div className="rounded-2xl border overflow-hidden transition-all hover:shadow-md"
      style={{ background: 'var(--card-bg)', borderColor: '#e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="h-1" style={{ background: '#1d4ed8' }} />

      <div className="px-5 py-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#eff6ff' }}>
              <svg className="w-5 h-5" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{report.id.slice(0, 16)}…</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{formatDate(report.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: statusColor }}>
              {statusName}
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${open ? 'rotate-180' : ''}`}
              style={{ background: '#f1f5f9' }}>
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid #f1f5f9' }}>
          <p className="text-xs font-bold uppercase tracking-widest mt-4 mb-3" style={{ color: 'var(--text-2)' }}>
            {t('statusHistory')}
          </p>

          {report.status_history && report.status_history.length > 0 ? (
            <div className="relative">
              <div className="absolute top-0 bottom-0 w-px" style={{ background: '#e2e8f0', [lang === 'ar' ? 'right' : 'left']: '10px' }} />
              <div className="space-y-3">
                {(report.status_history as ReportStatusHistory[])
                  .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
                  .map((h, i) => (
                    <div key={h.id} className="flex items-start" style={{ paddingRight: lang === 'ar' ? '26px' : undefined, paddingLeft: lang === 'ar' ? undefined : '26px' }}>
                      <div className="absolute w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                        style={{ backgroundColor: i === 0 ? '#1d4ed8' : '#cbd5e1', [lang === 'ar' ? 'right' : 'left']: '3px', marginTop: '2px' }}>
                        {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                            {h.status ? (lang === 'ar' ? h.status.name_ar : h.status.name_en) : '—'}
                          </span>
                          {h.note && (
                            <span className="text-sm" style={{ color: 'var(--text-2)' }}>— {h.note}</span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{formatDate(h.changed_at)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>{lang === 'ar' ? 'لا يوجد سجل' : 'No history yet'}</p>
          )}

          {report.file_url && (() => {
            let urls: string[]
            try { urls = JSON.parse(report.file_url) } catch { urls = [report.file_url] }
            return (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-2)' }}>
                  {lang === 'ar' ? 'المرفقات' : 'Attachments'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {urls.map((url, i) => {
                    const isVideo = /\.(mp4|mov|webm|avi|mkv)/i.test(url)
                    return (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="relative rounded-xl overflow-hidden aspect-square group block"
                        style={{ background: '#f1f5f9' }}>
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-7 h-7" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt={`attachment-${i + 1}`} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
