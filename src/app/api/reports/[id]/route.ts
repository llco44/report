import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET(_req: Request, ctx: RouteContext<'/api/reports/[id]'>) {
  const { id } = await ctx.params
  const db = createAdminSupabase()

  const { data, error } = await db
    .from('reports')
    .select(`
      *,
      status:report_statuses(*),
      answers:report_answers(*, question:custom_questions(*)),
      status_history:report_status_history(*, status:report_statuses(*))
    `)
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

export async function PATCH(req: Request, ctx: RouteContext<'/api/reports/[id]'>) {
  const { id } = await ctx.params
  const body = await req.json()
  const { status_id, note } = body

  const db = createAdminSupabase()

  const { data, error } = await db
    .from('reports')
    .update({ status_id, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Record history
  await db.from('report_status_history').insert({
    report_id: id,
    status_id,
    note: note ?? null,
  })

  return Response.json(data)
}
