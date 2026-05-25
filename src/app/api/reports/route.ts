import { createAdminSupabase } from '@/lib/supabase-server'
import { sendNewReportEmail } from '@/lib/email'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const statusId = searchParams.get('status')
  const search = searchParams.get('search')

  const db = createAdminSupabase()

  let query = db
    .from('reports')
    .select(`
      *,
      status:report_statuses(*),
      answers:report_answers(*, question:custom_questions(*))
    `)
    .order('created_at', { ascending: false })

  if (statusId) query = query.eq('status_id', statusId)
  if (search) query = query.ilike('phone_number', `%${search}%`)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone_number, answers, file_url } = body

  if (!phone_number) {
    return Response.json({ error: 'Phone number is required' }, { status: 400 })
  }

  const db = createAdminSupabase()

  // Get default status
  const { data: defaultStatus } = await db
    .from('report_statuses')
    .select('id')
    .eq('is_default', true)
    .single()

  const { data: report, error: reportError } = await db
    .from('reports')
    .insert({
      phone_number,
      status_id: defaultStatus?.id ?? null,
      file_url: file_url ?? null,
    })
    .select()
    .single()

  if (reportError) return Response.json({ error: reportError.message }, { status: 500 })

  // Insert answers
  if (answers && Array.isArray(answers) && answers.length > 0) {
    const { error: answersError } = await db.from('report_answers').insert(
      answers.map((a: { question_id: string; answer_value: string }) => ({
        report_id: report.id,
        question_id: a.question_id,
        answer_value: a.answer_value,
      }))
    )
    if (answersError) console.error('Answers insert error:', answersError)
  }

  // Add initial status history
  if (defaultStatus?.id) {
    await db.from('report_status_history').insert({
      report_id: report.id,
      status_id: defaultStatus.id,
      note: 'تم استلام البلاغ',
    })
  }

  // Send email notification
  const emailAnswers: Record<string, string> = {}
  if (answers && Array.isArray(answers)) {
    for (const a of answers) {
      emailAnswers[a.question_ar ?? a.question_id] = a.answer_value
    }
  }
  sendNewReportEmail(report.id, phone_number, emailAnswers).catch(console.error)

  return Response.json(report, { status: 201 })
}
