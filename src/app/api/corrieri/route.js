import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.from('corrieri').select('*').order('nome')
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const { nome } = await request.json()
    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome obbligatorio' }, { status: 400 })
    }
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('corrieri')
      .insert({ nome: nome.trim() })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
