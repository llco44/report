import { createAdminSupabase, createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const db = createAdminSupabase()
  const { count } = await db
    .from('admin_users')
    .select('*', { count: 'exact', head: true })

  return Response.json({ hasAdmin: (count ?? 0) > 0 })
}

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  const db = createAdminSupabase()

  // Only allow if no admins exist
  const { count } = await db
    .from('admin_users')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) > 0) {
    return Response.json({ error: 'Admin already exists' }, { status: 403 })
  }

  // Create user via Supabase Auth Admin API
  const { data: userData, error: userError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (userError) return Response.json({ error: userError.message }, { status: 500 })

  // Add to admin_users
  const { error: adminError } = await db
    .from('admin_users')
    .insert({ user_id: userData.user.id, name: name ?? 'مدير النظام' })

  if (adminError) return Response.json({ error: adminError.message }, { status: 500 })

  // Sign in
  const supabase = await createServerSupabase()
  await supabase.auth.signInWithPassword({ email, password })

  return Response.json({ success: true })
}
