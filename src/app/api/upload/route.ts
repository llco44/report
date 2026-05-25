import { createAdminSupabase } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const db = createAdminSupabase()
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await db.storage
    .from('report-files')
    .upload(fileName, file, { contentType: file.type })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = db.storage
    .from('report-files')
    .getPublicUrl(data.path)

  return Response.json({ url: publicUrl })
}
