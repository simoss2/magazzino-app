import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// GET /api/portali — lista portali
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('portali').select('*').order('nome')
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/portali — crea nuovo portale
export async function POST(request) {
  try {
    const { nome } = await request.json()
    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome obbligatorio' }, { status: 400 })
    }
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('portali')
      .insert({ nome: nome.trim() })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
