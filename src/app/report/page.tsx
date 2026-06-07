'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language'
import SiteHeader from '@/components/SiteHeader'
import type { CustomQuestion, QuestionOption } from '@/lib/types'

interface AnswerMap { [questionId: string]: string }

export default function ReportPage() {
  const { t, lang } = useLanguage()
  const [questions, setQuestions] = useState<CustomQuestion[]>([])
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [phone, setPhone] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [questionsError, setQuestionsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState('')
  const mediaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/questions')
      .then(async r => {
        const data = await r.json()
        if (Array.isArray(data)) {
          setQuestions(data)
        } else {
          setQuestionsError(data?.error ?? 'Failed to load questions')
        }
        setLoading(false)
      })
      .catch(err => {
        setQuestionsError(String(err))
        setLoading(false)
      })
  }, [])

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      const next = Array.from(incoming).filter(f => !existing.has(f.name + f.size))
      return [...prev, ...next]
    })
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) { setError(lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required'); return }
    setSubmitting(true)
    setError('')
    setUploadProgress(0)

    const fileUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData()
      fd.append('file', files[i])
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) fileUrls.push((await res.json()).url)
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }

    const answersArr = questions.map(q => ({
      question_id: q.id,
      answer_value: answers[q.id] ?? '',
      question_ar: q.question_ar,
    })).filter(a => a.answer_value)

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: phone.trim(),
        answers: answersArr,
        file_url: fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
      }),
    })

    if (res.ok) {
      setSubmitted((await res.json()).id)
    } else {
      setError((await res.json()).error ?? t('error'))
    }
    setSubmitting(false)
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--page-bg)' }}>
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center animate-slide-up border border-gray-100"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {/* Check icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#eff6ff' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#1d4ed8' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">{t('reportSubmitted')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t('trackYourStatus')}</p>

          <div className="rounded-xl p-4 mb-6 text-start border" style={{ background: '#f8faff', borderColor: '#bfdbfe' }}>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">{t('reportId')}</p>
            <p className="font-mono font-semibold text-blue-800 text-sm break-all">{submitted}</p>
            <div className="mt-2.5 pt-2.5 border-t border-blue-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-blue-700 font-semibold" dir="ltr">{phone}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/status"
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 text-center text-sm"
              style={{ background: '#1d4ed8' }}>
              {t('trackReport')}
            </Link>
            <Link href="/"
              className="flex-1 py-3 rounded-xl font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all text-center text-sm">
              {t('home')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>

      <SiteHeader showBack navLink={{ href: '/status', label: t('trackReport') }} />

      <main className="max-w-xl mx-auto px-4 py-6 sm:py-10">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-1)' }}>{t('reportFormTitle')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
            {lang === 'ar' ? 'أدخل بياناتك بدقة وسنتواصل معك في أقرب وقت' : 'Fill in your details and we\'ll get back to you shortly'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card-bg)', borderColor: '#e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

          {/* Thin blue top accent */}
          <div className="h-1" style={{ background: '#1d4ed8' }} />

          {/* Form body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t('phoneNumber')}
                <span className="text-red-500 ms-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ [lang === 'ar' ? 'right' : 'left']: '14px' }}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="05xxxxxxxx"
                  className="field-input"
                  style={{ paddingRight: lang === 'ar' ? '44px' : '16px', paddingLeft: lang === 'ar' ? '16px' : '44px' }}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Dynamic questions */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{t('loading')}</span>
              </div>
            ) : questionsError ? (
              <div className="rounded-2xl p-5 flex items-start gap-3"
                style={{ background: '#fff7ed', border: '2px solid #fed7aa' }}>
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-orange-800 mb-0.5">
                    {lang === 'ar' ? 'لم يتم إعداد قاعدة البيانات بعد' : 'Database not set up yet'}
                  </p>
                  <p className="text-xs text-orange-700">
                    {lang === 'ar'
                      ? 'يرجى تشغيل ملف supabase-schema.sql في محرر SQL الخاص بـ Supabase أولاً.'
                      : 'Please run supabase-schema.sql in your Supabase SQL Editor first.'}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-orange-500 font-mono mt-1 break-all">{questionsError}</p>
                  )}
                </div>
              </div>
            ) : (
              questions.map(q => (
                <QuestionField
                  key={q.id}
                  question={q}
                  lang={lang}
                  value={answers[q.id] ?? ''}
                  onChange={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                />
              ))
            )}
{/* Priority */}
<div>
  <label className="block text-sm font-bold text-gray-700 mb-2">
    الأولوية
  </label>

  <select className="field-input">
    <option>عادي</option>
    <option>متوسط</option>
    <option>عاجل</option>
  </select>
</div>

{/* Media upload */}
            {/* Media upload */}
            {!loading && !questionsError && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {lang === 'ar' ? 'الصور والمقاطع (اختياري)' : 'Photos & Videos (optional)'}
                </label>

                <input
                  ref={mediaRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={e => addFiles(e.target.files)}
                />

                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => mediaRef.current?.click()}
                  className="border-2 border-dashed rounded-xl py-6 px-4 text-center cursor-pointer transition-all"
                  style={{ borderColor: files.length ? '#93c5fd' : '#e2e8f0', background: files.length ? '#f0f7ff' : 'transparent' }}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#eff6ff' }}>
                      <svg className="w-5 h-5" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: '#1d4ed8' }}>
                      {lang === 'ar' ? 'اضغط لإضافة ملفات أو اسحبها هنا' : 'Click to add files or drag & drop'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                      {lang === 'ar' ? 'صور وفيديو — يمكن اختيار أكثر من ملف' : 'Images & videos — multiple files supported'}
                    </p>
                  </div>
                </div>

                {/* Previews */}
                {files.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {files.map((f, i) => (
                      <FilePreview key={i} file={f} onRemove={() => removeFile(i)} />
                    ))}
                  </div>
                )}

                {/* Upload progress */}
                {submitting && files.length > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                        {lang === 'ar' ? 'جارٍ الرفع...' : 'Uploading...'}
                      </span>
                      <span className="text-xs font-bold" style={{ color: '#1d4ed8' }}>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, background: '#1d4ed8' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-black text-base py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-3"
              style={{ background: '#1d4ed8', boxShadow: '0 4px 16px rgba(29,78,216,0.3)' }}>
              {submitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  {t('submitReport')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === 'ar' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

/* ── Shared label wrapper ── */
function FieldWrapper({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ms-1">*</span>}
      </label>
      {children}
    </div>
  )
}

/* ── File preview thumbnail ── */
function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [src, setSrc] = useState<string | null>(null)
  const isVideo = file.type.startsWith('video/')

  useEffect(() => {
    if (!isVideo) {
      const url = URL.createObjectURL(file)
      setSrc(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file, isVideo])

  return (
    <div className="relative rounded-xl overflow-hidden aspect-square group"
      style={{ background: '#f1f5f9' }}>
      {isVideo ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
          <svg className="w-7 h-7" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-center font-medium leading-tight" style={{ color: 'var(--text-2)' }}
            title={file.name}>
            {file.name.length > 14 ? file.name.slice(0, 12) + '…' : file.name}
          </p>
        </div>
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={file.name} className="w-full h-full object-cover" />
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.6)' }}>
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

/* ── Dynamic question field ── */
function QuestionField({ question, lang, value, onChange }: {
  question: CustomQuestion; lang: string; value: string
  onChange: (v: string) => void
}) {
  const label = lang === 'ar' ? question.question_ar : question.question_en
  return (
    <FieldWrapper label={label} required={question.is_required}>

      {question.type === 'text' && (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          required={question.is_required} className="field-input" />
      )}

      {question.type === 'textarea' && (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          required={question.is_required} rows={4}
          className="field-input resize-none" />
      )}

      {question.type === 'number' && (
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          required={question.is_required} className="field-input" />
      )}

      {question.type === 'boolean' && (
        <div className="grid grid-cols-2 gap-3">
          {['true', 'false'].map(v => (
            <label key={v} className={`flex items-center justify-center gap-2 border-2 rounded-2xl py-3.5 cursor-pointer font-semibold transition-all ${
              value === v
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
            }`}>
              <input type="radio" name={question.id} value={v} checked={value === v} onChange={() => onChange(v)} className="hidden" />
              <span className="text-lg">{v === 'true' ? '✅' : '❌'}</span>
              {v === 'true' ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
            </label>
          ))}
        </div>
      )}

      {question.type === 'select' && question.options && (
        <select value={value} onChange={e => onChange(e.target.value)}
          required={question.is_required} className="field-input bg-white appearance-none cursor-pointer">
          <option value="">— {lang === 'ar' ? 'اختر خياراً' : 'Choose an option'} —</option>
          {(question.options as QuestionOption[]).map(opt => (
            <option key={opt.value} value={opt.value}>
              {lang === 'ar' ? opt.label_ar : opt.label_en}
            </option>
          ))}
        </select>
      )}

    </FieldWrapper>
  )
}
