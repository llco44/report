'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/language'
import type { ReportStatus } from '@/lib/types'

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#F97316', '#6B7280', '#06B6D4',
  '#EC4899', '#84CC16',
]

export default function StatusesPage() {
  const { t, lang } = useLanguage()
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ReportStatus | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name_ar: '', name_en: '', color: '#3B82F6', is_default: false })

  const DEFAULT_STATUSES = [
    { name_ar: 'جديد',           name_en: 'New',         color: '#3B82F6', is_default: true  },
    { name_ar: 'قيد المعالجة',   name_en: 'In Progress', color: '#F59E0B', is_default: false },
    { name_ar: 'مكتمل',          name_en: 'Completed',   color: '#10B981', is_default: false },
    { name_ar: 'مرفوض',          name_en: 'Rejected',    color: '#EF4444', is_default: false },
  ]

  async function load() {
    const d = await fetch('/api/statuses').then(r => r.json())
    const list: ReportStatus[] = Array.isArray(d) ? d : []
    if (list.length === 0) {
      await Promise.all(DEFAULT_STATUSES.map(s =>
        fetch('/api/statuses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
      ))
      const d2 = await fetch('/api/statuses').then(r => r.json())
      setStatuses(Array.isArray(d2) ? d2 : [])
    } else {
      setStatuses(list)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ name_ar: '', name_en: '', color: '#3B82F6', is_default: false })
    setShowForm(true)
  }

  function openEdit(s: ReportStatus) {
    setEditing(s)
    setForm({ name_ar: s.name_ar, name_en: s.name_en, color: s.color, is_default: s.is_default })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_ar.trim() || !form.name_en.trim()) return
    setSaving(true)

    if (editing) {
      await fetch(`/api/statuses/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }

    setSaving(false)
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return
    await fetch(`/api/statuses/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/statuses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_default: true }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('manageStatuses')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'ar' ? `${statuses.length} حالات` : `${statuses.length} statuses`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 16px rgba(29,78,216,0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addStatus')}
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)' }}>
              <h2 className="font-black text-white text-lg">{editing ? t('editStatus') : t('addStatus')}</h2>
              <button onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('statusNameAr')} *</label>
                <input
                  type="text"
                  value={form.name_ar}
                  onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                  required
                  className="field-input"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('statusNameEn')} *</label>
                <input
                  type="text"
                  value={form.name_en}
                  onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                  required
                  dir="ltr"
                  className="field-input"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('statusColor')}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        backgroundColor: c,
                        boxShadow: form.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined,
                        transform: form.color === c ? 'scale(1.15)' : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-11 h-11 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5"
                  />
                  <div className="flex-1 rounded-xl h-11 flex items-center px-4 text-sm font-mono text-white font-bold"
                    style={{ backgroundColor: form.color }}>
                    {form.color.toUpperCase()}
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm font-bold text-gray-700">{t('defaultStatus')}</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 text-white font-black py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}
                >
                  {saving ? t('saving') : t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 rounded-xl transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {statuses.map(s => (
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-md"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderInlineStart: `4px solid ${s.color}` }}>

              {/* Info row */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: s.color + '20' }}>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-gray-900">{s.name_ar}</p>
                    <span className="text-gray-300 text-xs">|</span>
                    <p className="text-gray-500 text-sm font-semibold" dir="ltr">{s.name_en}</p>
                    {s.is_default && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        {lang === 'ar' ? 'افتراضي' : 'Default'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono" dir="ltr">{s.color.toUpperCase()}</p>
                </div>
              </div>

              {/* Action strip */}
              <div className="flex border-t" style={{ borderColor: '#f1f5f9' }}>
                {!s.is_default && (
                  <>
                    <button
                      onClick={() => handleSetDefault(s.id)}
                      className="flex-1 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {t('setDefault')}
                    </button>
                    <div className="w-px" style={{ background: '#f1f5f9' }} />
                  </>
                )}
                <button
                  onClick={() => openEdit(s)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t('edit')}
                </button>
                <div className="w-px" style={{ background: '#f1f5f9' }} />
                <button
                  onClick={() => handleDelete(s.id)}
                  className="flex-1 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
          {statuses.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {lang === 'ar' ? 'لا توجد حالات — أضف حالة أولى' : 'No statuses — add one'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
