import { Resend } from 'resend'
import { createAdminSupabase } from './supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)

async function getNotifyEmails(): Promise<string[]> {
  const { data } = await createAdminSupabase()
    .from('app_settings')
    .select('value')
    .eq('key', 'notify_emails')
    .single()
  if (!data?.value) return []
  return data.value.split(',').map((e: string) => e.trim()).filter(Boolean)
}

export async function sendNewReportEmail(
  reportId: string,
  phone: string,
  answers: Record<string, string>
) {
  // Save to notifications table (best-effort)
  try {
    await createAdminSupabase().from('notifications').insert({
      report_id: reportId,
      phone_number: phone,
      answers,
      read: false,
    })
  } catch { /* table may not exist */ }

  // Send actual email
  try {
    const to = await getNotifyEmails()
    if (to.length === 0) return

    const answersHtml = Object.entries(answers)
      .map(([q, a]) => `<tr><td style="padding:6px 12px;color:#64748b;font-size:14px;">${q}</td><td style="padding:6px 12px;font-size:14px;font-weight:600;">${a}</td></tr>`)
      .join('')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

    await resend.emails.send({
      from: 'Rama Reports <onboarding@resend.dev>',
      to,
      subject: `بلاغ جديد #${reportId.slice(0, 8)} — ${phone}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;">بلاغ جديد وصل</h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">رقم البلاغ: ${reportId.slice(0, 8)}</p>
          </div>
          <div style="padding:24px 32px;">
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">تم استلام بلاغ جديد بالتفاصيل التالية:</p>
            <table style="width:100%;border-collapse:collapse;background:#f8faff;border-radius:8px;overflow:hidden;">
              <tr style="background:#eff6ff;">
                <td style="padding:8px 12px;color:#64748b;font-size:14px;">رقم الهاتف</td>
                <td style="padding:8px 12px;font-size:14px;font-weight:600;direction:ltr;">${phone}</td>
              </tr>
              ${answersHtml}
            </table>
            ${appUrl ? `<div style="margin-top:24px;"><a href="${appUrl}/admin/reports" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">عرض البلاغ في لوحة التحكم</a></div>` : ''}
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }
}
