import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET() {
  const db = createAdminSupabase()
  const { data, error } = await db.from('app_settings').select('*')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  // Return as key→value map
  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value
  return Response.json(map)
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const db = createAdminSupabase()
  const updates = Object.entries(body as Record<string, string>)

  for (const [key, value] of updates) {
    const { error } = await db
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
