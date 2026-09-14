import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

// POST /api/upload — carica PDF su Supabase Storage
export async function POST(request) {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file')
    const tipo = formData.get('tipo')

    if (!file || !tipo) {
      return NextResponse.json({ error: 'File o tipo mancante' }, { status: 400 })
    }

    // Limite 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File troppo grande (max 10MB)' }, { status: 400 })
    }

    // Validazione estensione
    const nomeOriginale = file.name || ''
    if (!nomeOriginale.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Solo file PDF sono accettati' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Validazione magic number PDF (%PDF-)
    if (buffer.length < 5 || buffer.slice(0, 5).toString('ascii') !== '%PDF-') {
      return NextResponse.json({ error: 'Il file non è un PDF valido' }, { status: 400 })
    }
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
