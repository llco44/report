'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/language'
import type { CustomQuestion, QuestionOption, QuestionType } from '@/lib/types'

const QUESTION_TYPES: QuestionType[] = ['text', 'textarea', 'number', 'boolean', 'select', 'file']

const typeKeyMap: Record<QuestionType, string> = {
  text: 'typeText',
  textarea: 'typeTextarea',
  number: 'typeNumber',
  boolean: 'typeBoolean',
  select: 'typeSelect',
  file: 'typeFile',
}

const TYPE_COLORS: Record<QuestionType, string> = {
  text: '#3B82F6',
  textarea: '#6366F1',
  number: '#F59E0B',
  boolean: '#10B981',
  select: '#8B5CF6',
  file: '#F97316',
}

interface FormState {
  question_ar: string
  question_en: string
  type: QuestionType
  is_required: boolean
  sort_order: number
  options: QuestionOption[]
}

const emptyForm: FormState = {
  question_ar: '', question_en: '', type: 'text', is_required: false, sort_order: 0, options: [],
}

export default function QuestionsPage() {
  const { t, lang } = useLanguage()
  const [questions, setQuestions] = useState<CustomQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CustomQuestion | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const DEFAULT_QUESTIONS = [
    { question_ar: 'وصف المشكلة',  question_en: 'Problem description', type: 'textarea' as QuestionType, is_required: true,  sort_order: 0, options: null },
    { question_ar: 'العنوان',        question_en: 'Address',             type: 'text'     as QuestionType, is_required: true,  sort_order: 1, options: null },
    { question_ar: 'نوع العطل',      question_en: 'Type of issue',       type: 'select'   as QuestionType, is_required: false, sort_order: 2,
      options: [
        { label_ar: 'كهرباء',  label_en: 'Electrical', value: 'electrical' },
        { label_ar: 'سباكة',   label_en: 'Plumbing',   value: 'plumbing'   },
        { label_ar: 'تكييف',   label_en: 'AC',         value: 'ac'         },
        { label_ar: 'أخرى',    label_en: 'Other',      value: 'other'      },
      ],
    },
  ]

  async function load() {
    setLoading(true)
    try {
      const d = await fetch('/api/questions?all=true').then(r => r.json())
      const list: CustomQuestion[] = Array.isArray(d) ? d : []
      if (list.length === 0) {
        await Promise.all(DEFAULT_QUESTIONS.map(q =>
          fetch('/api/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) })
        ))
        const d2 = await fetch('/api/questions?all=true').then(r => r.json())
        setQuestions(Array.isArray(d2) ? d2 : [])
      } else {
        setQuestions(list)
      }
    } catch { /* table may not exist yet */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyForm, sort_order: questions.length })
    setShowForm(true)
  }

  function openEdit(q: CustomQuestion) {
    setEditing(q)
    setForm({
      question_ar: q.question_ar,
      question_en: q.question_en,
      type: q.type,
      is_required: q.is_required,
      sort_order: q.sort_order,
      options: (q.options as QuestionOption[]) ?? [],
    })
    setShowForm(true)
  }

  function addOption() {
    setForm(f => ({ ...f, options: [...f.options, { label_ar: '', label_en: '', value: '' }] }))
  }

  function updateOption(i: number, field: keyof QuestionOption, val: string) {
    setForm(f => {
      const opts = [...f.options]
      opts[i] = { ...opts[i], [field]: val }
      return { ...f, options: opts }
    })
  }

  function removeOption(i: number) {
    setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.question_ar.trim() || !form.question_en.trim()) return
    setSaving(true)

    const payload = {
      ...form,
      options: (form.type === 'select') ? form.options : null,
    }

    if (editing) {
      await fetch(`/api/questions/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setSaving(false)
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return
    await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    load()
  }

  async function handleToggleActive(q: CustomQuestion) {
    await fetch(`/api/questions/${q.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !q.is_active }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t('manageQuestions')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'ar' ? `${questions.length} أسئلة` : `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
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
          {t('addQuestion')}
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)' }}>
              <h2 className="font-black text-white text-lg">{editing ? t('editStatus') : t('addQuestion')}</h2>
              <button onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('questionAr')} *</label>
                <input
                  type="text"
                  value={form.question_ar}
                  onChange={e => setForm(f => ({ ...f, question_ar: e.target.value }))}
                  required
                  className="field-input"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('questionEn')} *</label>
                <input
                  type="text"
                  value={form.question_en}
                  onChange={e => setForm(f => ({ ...f, question_en: e.target.value }))}
                  required
                  dir="ltr"
                  className="field-input"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('questionType')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUESTION_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type, options: [] }))}
                      className="px-3 py-2.5 rounded-xl text-sm font-bold transition-all border-2"
                      style={form.type === type ? {
                        backgroundColor: TYPE_COLORS[type],
                        borderColor: TYPE_COLORS[type],
                        color: '#fff',
                        boxShadow: `0 4px 12px ${TYPE_COLORS[type]}44`,
                      } : {
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                      }}
                    >
                      {t(typeKeyMap[type] as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options for select type */}
              {form.type === 'select' && (
                <div className="rounded-2xl p-4 space-y-3" style={{ background: '#f8faff', border: '2px solid #e8f0fe' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">{t('options')}</p>
                    <button type="button" onClick={addOption}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {t('addOption')}
                    </button>
                  </div>
                  {form.options.map((opt, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={opt.label_ar}
                        onChange={e => updateOption(i, 'label_ar', e.target.value)}
                        placeholder={t('optionAr')}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      />
                      <input
                        type="text"
                        value={opt.label_en}
                        onChange={e => updateOption(i, 'label_en', e.target.value)}
                        placeholder={t('optionEn')}
                        dir="ltr"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={opt.value}
                          onChange={e => updateOption(i, 'value', e.target.value)}
                          placeholder={t('optionValue')}
                          dir="ltr"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="w-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {form.options.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-2">
                      {lang === 'ar' ? 'لا توجد خيارات — اضغط "إضافة خيار"' : 'No options — click "Add Option"'}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_required}
                    onChange={e => setForm(f => ({ ...f, is_required: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm font-bold text-gray-700">{t('required')}</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-700">{t('order')}:</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    min={0}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
              </div>

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
          {questions.map((q, idx) => (
            <div key={q.id}
              className={`bg-white rounded-2xl overflow-hidden transition-all hover:shadow-md ${!q.is_active ? 'opacity-60' : ''}`}
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderInlineStart: `4px solid ${TYPE_COLORS[q.type]}` }}
            >
              {/* Info row */}
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
                  style={{ backgroundColor: TYPE_COLORS[q.type] }}>
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-gray-900 leading-snug">{q.question_ar}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{q.question_en}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: TYPE_COLORS[q.type] }}>
                      {t(typeKeyMap[q.type] as Parameters<typeof t>[0])}
                    </span>
                    {q.is_required && (
                      <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{t('required')}</span>
                    )}
                    {!q.is_active && (
                      <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {lang === 'ar' ? 'معطّل' : 'Disabled'}
                      </span>
                    )}
                    {q.options && Array.isArray(q.options) && (q.options as QuestionOption[]).length > 0 && (
                      <span className="text-xs text-gray-400 font-medium">
                        {(q.options as QuestionOption[]).length} {lang === 'ar' ? 'خيارات' : 'options'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action strip */}
              <div className="flex border-t" style={{ borderColor: '#f1f5f9' }}>
                <button
                  onClick={() => handleToggleActive(q)}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                    q.is_active
                      ? 'text-gray-500 hover:bg-gray-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {q.is_active ? (lang === 'ar' ? 'تعطيل' : 'Disable') : (lang === 'ar' ? 'تفعيل' : 'Enable')}
                </button>
                <div className="w-px" style={{ background: '#f1f5f9' }} />
                <button
                  onClick={() => openEdit(q)}
                  className="flex-1 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {t('edit')}
                </button>
                <div className="w-px" style={{ background: '#f1f5f9' }} />
                <button
                  onClick={() => handleDelete(q.id)}
                  className="flex-1 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {lang === 'ar' ? 'لا توجد أسئلة — أضف سؤالاً أولاً' : 'No questions — add one'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
