'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/language'

export default function SettingsPage() {
  const { lang } = useLanguage()
  const [emails, setEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const DEFAULT_EMAIL = 'sho.admin57@gmail.com'

  async function load() {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const raw: string = data.notify_emails ?? ''
        const list = raw.split(',').map((e: string) => e.trim()).filter(Boolean)
        const withDefault = list.includes(DEFAULT_EMAIL) ? list : [DEFAULT_EMAIL, ...list]
        setEmails(withDefault)
        if (!list.includes(DEFAULT_EMAIL)) {
          await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notify_emails: withDefault.join(', ') }),
          })
        }
      } else {
        setEmails([DEFAULT_EMAIL])
      }
    } catch {
      setEmails([DEFAULT_EMAIL])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save(list: string[]) {
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notify_emails: list.join(', ') }),
    })
    setSaving(false)
    setMsg(res.ok
      ? (lang === 'ar' ? 'تم الحفظ بنجاح ✓' : 'Saved successfully ✓')
      : (lang === 'ar' ? 'حدث خطأ' : 'Error saving'))
    setTimeout(() => setMsg(''), 3000)
  }

  function addEmail() {
    const trimmed = newEmail.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) return
    if (emails.includes(trimmed)) { setNewEmail(''); return }
    const updated = [...emails, trimmed]
    setEmails(updated)
    setNewEmail('')
    save(updated)
  }

  function removeEmail(email: string) {
    const updated = emails.filter(e => e !== email)
    setEmails(updated)
    save(updated)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          {lang === 'ar' ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {lang === 'ar' ? 'إدارة إعدادات النظام' : 'Manage system configuration'}
        </p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {/* Card header */}
        <div className="relative overflow-hidden px-6 py-6"
          style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%)' }}>
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-black text-lg">
                {lang === 'ar' ? 'بريد الإشعارات' : 'Notification Emails'}
              </h2>
              <p className="text-blue-200 text-sm mt-0.5">
                {lang === 'ar'
                  ? 'سيتم إرسال إشعار لهذه العناوين عند وصول بلاغ جديد'
                  : 'These addresses receive an email whenever a new report is filed'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Email list */}
              <div className="space-y-2">
                {emails.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl" style={{ background: '#f8faff', border: '2px dashed #e0e7ff' }}>
                    <svg className="w-10 h-10 mx-auto mb-2 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">
                      {lang === 'ar' ? 'لا توجد عناوين بريد مضافة' : 'No email addresses added yet'}
                    </p>
                  </div>
                ) : (
                  emails.map(email => (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-2xl px-3 py-3 group transition-all hover:shadow-sm"
                      style={{ background: '#f8faff', border: '1px solid #e0e7ff' }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="flex-1 min-w-0 text-xs sm:text-sm font-semibold text-gray-800 font-mono truncate" dir="ltr">{email}</span>
                      <button
                        onClick={() => removeEmail(email)}
                        disabled={saving}
                        className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-2 sm:px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">{lang === 'ar' ? 'حذف' : 'Remove'}</span>
                        <span className="sm:hidden">{lang === 'ar' ? 'حذف' : ''}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add email */}
              <div className="flex gap-2 pt-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ [lang === 'ar' ? 'right' : 'left']: '14px' }}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addEmail()}
                    placeholder={lang === 'ar' ? 'أضف بريداً إلكترونياً...' : 'Add email address...'}
                    dir="ltr"
                    className="field-input"
                    style={{ paddingRight: lang === 'ar' ? '44px' : '16px', paddingLeft: lang === 'ar' ? '16px' : '44px' }}
                  />
                </div>
                <button
                  onClick={addEmail}
                  disabled={saving || !newEmail.trim()}
                  className="flex-shrink-0 text-white font-bold px-3 sm:px-6 py-3 rounded-2xl text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 16px rgba(29,78,216,0.3)' }}
                >
                  {saving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">
                    {saving ? (lang === 'ar' ? 'جارٍ...' : 'Saving...') : (lang === 'ar' ? 'إضافة' : 'Add')}
                  </span>
                  <span className="sm:hidden">
                    {saving ? '' : (lang === 'ar' ? 'إضافة' : '')}
                  </span>
                </button>
              </div>

              {msg && (
                <div className={`flex items-center gap-2 text-sm font-bold px-4 py-3 rounded-xl ${
                  msg.includes('✓') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {msg.includes('✓')
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    }
                  </svg>
                  {msg}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
