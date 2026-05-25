import { createAdminSupabase } from '@/lib/supabase-server'

export async function PATCH(req: Request, ctx: RouteContext<'/api/statuses/[id]'>) {
  const { id } = await ctx.params
  const body = await req.json()
  const db = createAdminSupabase()

  if (body.is_default) {
    await db.from('report_statuses').update({ is_default: false }).neq('id', id)
  }

  const { data, error } = await db
    .from('report_statuses')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/statuses/[id]'>) {
  const { id } = await ctx.params
  const db = createAdminSupabase()

  const { error } = await db.from('report_statuses').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
