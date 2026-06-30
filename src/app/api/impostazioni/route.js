import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// GET /api/impostazioni
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('impostazioni').select('*')
    if (error) throw error

    const result = Object.fromEntries(data.map(i => [i.chiave, i.valore]))
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/impostazioni
export async function PUT(request) {
  try {
    const body = await request.json()
    const supabase = createSupabaseAdminClient()

    const aggiornamenti = Object.entries(body).map(([chiave, valore]) => ({
      chiave,
      valore,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('impostazioni')
      .upsert(aggiornamenti, { onConflict: 'chiave' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
