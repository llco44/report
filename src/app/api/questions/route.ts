import { createAdminSupabase } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const all = new URL(req.url).searchParams.get('all') === 'true'
  const db = createAdminSupabase()
  let query = db.from('custom_questions').select('*').order('sort_order')
  if (!all) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { question_ar, question_en, type, options, is_required, sort_order } = body

  if (!question_ar || !question_en || !type) {
    return Response.json({ error: 'question_ar, question_en, and type are required' }, { status: 400 })
  }

  const db = createAdminSupabase()
  const { data, error } = await db
    .from('custom_questions')
    .insert({
      question_ar,
      question_en,
      type,
      options: options ?? null,
      is_required: is_required ?? false,
      sort_order: sort_order ?? 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
