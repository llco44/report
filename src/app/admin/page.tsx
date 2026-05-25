'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import type { Report, ReportStatus } from '@/lib/types'

export default function AdminDashboard() {
  const { t, lang } = useLanguage()
  const [reports, setReports] = useState<Report[]>([])
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/reports').then(r => r.json()),
      fetch('/api/statuses').then(r => r.json()),
    ]).then(([r, s]) => {
      setReports(Array.isArray(r) ? r : [])
      setStatuses(Array.isArray(s) ? s : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const totalReports = reports.length
  const statusCounts = statuses.map(s => ({
    ...s,
    count: reports.filter(r => r.status_id === s.id).length,
  }))

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">{t('dashboardTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {lang === 'ar' ? 'نظرة عامة على النظام' : 'System overview'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={totalReports} label={t('totalReports')} color="#1d4ed8" />
            {statusCounts.slice(0, 3).map(s => (
              <StatCard key={s.id} value={s.count} label={lang === 'ar' ? s.name_ar : s.name_en} color={s.color} />
            ))}
          </div>

          {/* Status breakdown */}
          {statusCounts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">
                  {lang === 'ar' ? 'توزيع البلاغات حسب الحالة' : 'Reports by Status'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {statusCounts.map(s => (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: s.color + '20' }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {lang === 'ar' ? s.name_ar : s.name_en}
                        </span>
                        <span className="text-sm font-bold ms-2" style={{ color: s.color }}>{s.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: totalReports > 0 ? `${(s.count / totalReports) * 100}%` : '0%',
                            background: `linear-gradient(90deg,${s.color}aa,${s.color})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent reports */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{t('recentReports')}</h2>
              <Link href="/admin/reports"
                className="text-sm font-semibold px-4 py-1.5 rounded-xl transition-all text-blue-600 hover:text-white hover:bg-blue-600"
                style={{ border: '1px solid rgba(29,78,216,0.2)' }}>
                {lang === 'ar' ? 'عرض الكل' : 'View All'}
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {lang === 'ar' ? 'لا توجد بلاغات بعد' : 'No reports yet'}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reports.slice(0, 8).map(report => (
                  <Link
                    key={report.id}
                    href={`/admin/reports/${report.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: (report.status?.color ?? '#6B7280') + '20' }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: report.status?.color ?? '#6B7280' }} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm" dir="ltr">{report.phone_number}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(report.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                        style={{ backgroundColor: report.status?.color ?? '#6B7280' }}
                      >
                        {report.status ? (lang === 'ar' ? report.status.name_ar : report.status.name_en) : t('noStatus')}
                      </span>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === 'ar' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '18' }}>
        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 leading-tight mt-0.5">{label}</p>
      </div>
    </div>
  )
}
