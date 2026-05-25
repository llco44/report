import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET() {
  const db = createAdminSupabase()
  const { data, error } = await db
    .from('report_statuses')
    .select('*')
    .order('sort_order')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name_ar, name_en, color, sort_order, is_default } = body

  if (!name_ar || !name_en) {
    return Response.json({ error: 'name_ar and name_en are required' }, { status: 400 })
  }

  const db = createAdminSupabase()

  if (is_default) {
    await db.from('report_statuses').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  }

  const { data, error } = await db
    .from('report_statuses')
    .insert({ name_ar, name_en, color: color ?? '#6B7280', sort_order: sort_order ?? 0, is_default: is_default ?? false })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
