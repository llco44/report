'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import type { Report, ReportStatus } from '@/lib/types'

export default function ReportsListPage() {
  const { t, lang } = useLanguage()
  const [reports, setReports] = useState<Report[]>([])
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  function load() {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)

    Promise.all([
      fetch(`/api/reports?${params}`).then(r => r.json()),
      fetch('/api/statuses').then(r => r.json()),
    ]).then(([r, s]) => {
      setReports(Array.isArray(r) ? r : [])
      setStatuses(Array.isArray(s) ? s : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('allReports')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'ar' ? `${reports.length} بلاغ` : `${reports.length} report${reports.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ [lang === 'ar' ? 'right' : 'left']: '12px' }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث برقم الهاتف...' : 'Search by phone...'}
              className="border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white w-52"
              style={{ paddingRight: lang === 'ar' ? '36px' : '14px', paddingLeft: lang === 'ar' ? '14px' : '36px' }}
              dir="ltr"
            />
          </div>
          <button type="submit"
            className="text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 12px rgba(29,78,216,0.3)' }}>
            {t('search')}
          </button>
        </form>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            !statusFilter
              ? 'text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
          style={!statusFilter ? { background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 12px rgba(29,78,216,0.25)' } : {}}
        >
          {t('allStatuses')}
          <span className={`ms-1.5 text-xs ${!statusFilter ? 'text-blue-200' : 'text-gray-400'}`}>
            ({reports.length})
          </span>
        </button>
        {statuses.map(s => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              statusFilter === s.id
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
            style={statusFilter === s.id ? { backgroundColor: s.color, boxShadow: `0 4px 12px ${s.color}44` } : {}}
          >
            {lang === 'ar' ? s.name_ar : s.name_en}
          </button>
        ))}
      </div>

      {/* Loading / empty */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl text-center py-20 text-gray-400"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-semibold">{lang === 'ar' ? 'لا توجد بلاغات' : 'No reports'}</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="lg:hidden space-y-2">
            {reports.map(report => (
              <Link key={report.id} href={`/admin/reports/${report.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 active:bg-blue-50/50 transition-colors"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (report.status?.color ?? '#6B7280') + '20' }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: report.status?.color ?? '#6B7280' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base" dir="ltr">{report.phone_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(report.created_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: report.status?.color ?? '#6B7280' }}>
                    {report.status ? (lang === 'ar' ? report.status.name_ar : report.status.name_en) : t('noStatus')}
                  </span>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === 'ar' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg,#f8faff,#f0f4ff)' }}>
                    {[t('reportNumber'), t('phone'), t('status'), t('date'), t('actions')].map(h => (
                      <th key={h} className="px-6 py-4 text-start text-xs font-black text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.map(report => (
                    <tr key={report.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">{report.id.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800" dir="ltr">{report.phone_number}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                          style={{ backgroundColor: report.status?.color ?? '#6B7280' }}>
                          {report.status ? (lang === 'ar' ? report.status.name_ar : report.status.name_en) : t('noStatus')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(report.created_at)}</td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/reports/${report.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all border border-blue-200 hover:border-blue-600">
                          {t('viewReport')}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === 'ar' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
