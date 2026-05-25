import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { count } = await createAdminSupabase()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)
    return Response.json({ unread: count ?? 0 })
  } catch {
    return Response.json({ unread: 0 })
  }
}

export async function PATCH() {
  try {
    await createAdminSupabase()
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
  } catch { /* ignore */ }
  return Response.json({ ok: true })
}
