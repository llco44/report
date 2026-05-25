import { createAdminSupabase } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const phone = new URL(req.url).searchParams.get('phone')
  if (!phone) return Response.json({ error: 'Phone number required' }, { status: 400 })

  const db = createAdminSupabase()
  const { data, error } = await db
    .from('reports')
    .select(`
      id,
      phone_number,
      created_at,
      updated_at,
      file_url,
      status:report_statuses(id, name_ar, name_en, color),
      status_history:report_status_history(
        id, note, changed_at,
        status:report_statuses(id, name_ar, name_en, color)
      )
    `)
    .eq('phone_number', phone)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
