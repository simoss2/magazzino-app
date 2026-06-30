import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// POST /api/upload — carica PDF su Supabase Storage
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const tipo = formData.get('tipo') // 'bolla' o 'distinta'

    if (!file || !tipo) {
      return NextResponse.json({ error: 'File o tipo mancante' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const nomeFile = `${tipo}_${timestamp}_${file.name.replace(/\s/g, '_')}`

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase.storage
      .from('documenti')
      .upload(nomeFile, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('documenti')
      .getPublicUrl(nomeFile)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
