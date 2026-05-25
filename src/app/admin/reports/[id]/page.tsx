'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import type { Report, ReportStatus, ReportStatusHistory } from '@/lib/types'

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, lang } = useLanguage()
  const [id, setId] = useState<string>('')
  const [report, setReport] = useState<Report | null>(null)
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [newStatusId, setNewStatusId] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      Promise.all([
        fetch(`/api/reports/${p.id}`).then(r => r.json()),
        fetch('/api/statuses').then(r => r.json()),
      ]).then(([r, s]) => {
        setReport(r)
        setStatuses(Array.isArray(s) ? s : [])
        setNewStatusId(r?.status_id ?? '')
        setLoading(false)
      }).catch(() => setLoading(false))
    })
  }, [params])

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!newStatusId || !id) return
    setSaving(true)
    setSaveMsg('')

    const res = await fetch(`/api/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status_id: newStatusId, note: note.trim() || null }),
    })

    if (res.ok) {
      setSaveMsg(t('success'))
      setNote('')
      fetch(`/api/reports/${id}`).then(r => r.json()).then(setReport)
    } else {
      setSaveMsg(t('error'))
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <p className="text-gray-500 mb-4 font-semibold">{lang === 'ar' ? 'البلاغ غير موجود' : 'Report not found'}</p>
        <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 font-bold">{t('back')}</Link>
      </div>
    )
  }

  const currentStatus = statuses.find(s => s.id === report.status_id)

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link href="/admin/reports"
          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center transition-all hover:shadow-md"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === 'ar' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('reportDetails')}</h1>
          <p className="text-gray-400 text-xs font-mono mt-0.5">{report.id}</p>
        </div>
      </div>

      {/* Status banner */}
      <div className="rounded-2xl p-5 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg,${currentStatus?.color ?? '#6B7280'}22,${currentStatus?.color ?? '#6B7280'}11)`,
          border: `2px solid ${currentStatus?.color ?? '#6B7280'}33`,
        }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: currentStatus?.color ?? '#6B7280' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: currentStatus?.color ?? '#6B7280', opacity: 0.7 }}>
              {lang === 'ar' ? 'الحالة الحالية' : 'Current Status'}
            </p>
            <p className="font-black text-gray-900">
              {currentStatus ? (lang === 'ar' ? currentStatus.name_ar : currentStatus.name_en) : t('noStatus')}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-500">{formatDate(report.created_at)}</span>
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h2 className="font-black text-gray-900 mb-5">{lang === 'ar' ? 'معلومات البلاغ' : 'Report Info'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoBlock
            label={t('phone')}
            value={<span dir="ltr" className="font-bold text-gray-900">{report.phone_number}</span>}
            icon="📞"
          />
          <InfoBlock
            label={t('submittedAt')}
            value={<span className="text-gray-700">{formatDate(report.created_at)}</span>}
            icon="📅"
          />
        </div>

        {report.file_url && (() => {
          let urls: string[]
          try { urls = JSON.parse(report.file_url) } catch { urls = [report.file_url] }
          return (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
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
                          <svg className="w-8 h-8" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={`attachment-${i + 1}`} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Answers */}
      {report.answers && report.answers.length > 0 && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 className="font-black text-gray-900 mb-5">{t('answers')}</h2>
          <div className="space-y-4">
            {report.answers.map((answer, i) => (
              <div key={answer.id} className="flex gap-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black text-white mt-0.5"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
                  {i + 1}
                </div>
                <div className="flex-1 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    {answer.question ? (lang === 'ar' ? answer.question.question_ar : answer.question.question_en) : '—'}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{answer.answer_value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update status */}
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h2 className="font-black text-gray-900 mb-5">{t('updateStatus')}</h2>
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('selectStatus')}</label>
            <select
              value={newStatusId}
              onChange={e => setNewStatusId(e.target.value)}
              className="field-input"
            >
              <option value="">— {t('selectStatus')} —</option>
              {statuses.map(s => (
                <option key={s.id} value={s.id}>
                  {lang === 'ar' ? s.name_ar : s.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('addNote')}</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder={lang === 'ar' ? 'ملاحظة اختيارية...' : 'Optional note...'}
              className="field-input resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !newStatusId}
              className="text-white font-black px-7 py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 16px rgba(29,78,216,0.3)' }}
            >
              {saving && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              {saving ? t('saving') : t('save')}
            </button>
            {saveMsg && (
              <span className={`text-sm font-bold flex items-center gap-1.5 ${saveMsg === t('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                {saveMsg === t('success')
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  : null}
                {saveMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Status history */}
      {report.status_history && report.status_history.length > 0 && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 className="font-black text-gray-900 mb-5">{t('statusHistory')}</h2>
          <div className="relative">
            <div className="absolute top-0 bottom-0 w-0.5 bg-gray-100" style={{ [lang === 'ar' ? 'right' : 'left']: '11px' }} />
            <div className="space-y-4">
              {(report.status_history as ReportStatusHistory[])
                .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
                .map((h, i) => (
                  <div key={h.id} className="flex items-start gap-4"
                    style={{ paddingRight: lang === 'ar' ? '28px' : undefined, paddingLeft: lang === 'ar' ? undefined : '28px' }}>
                    <div className="absolute w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ backgroundColor: h.status?.color ?? '#6B7280', [lang === 'ar' ? 'right' : 'left']: '4px', marginTop: '2px' }}>
                      {i === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className={`flex-1 pb-1 ${lang === 'ar' ? 'pr-2' : 'pl-2'}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-gray-800">
                          {h.status ? (lang === 'ar' ? h.status.name_ar : h.status.name_en) : '—'}
                        </span>
                        {h.note && <span className="text-gray-500 text-sm">— {h.note}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(h.changed_at)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoBlock({ label, value, icon }: { label: string; value: React.ReactNode; icon: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#f8faff' }}>
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  )
}
