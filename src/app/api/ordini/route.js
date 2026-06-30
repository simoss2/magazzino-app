import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { inviaEmailNuovoOrdine } from '@/lib/email'

// GET /api/ordini — lista tutti gli ordini
export async function GET(request) {
  try {
    const supabase = createSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const stato = searchParams.get('stato')

    let query = supabase
      .from('ordini')
      .select('*')
      .order('created_at', { ascending: false })

    if (stato) query = query.eq('stato', stato)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/ordini — crea nuovo ordine
export async function POST(request) {
  try {
    const body = await request.json()
    const { nome_cliente, cognome_cliente, telefono_cliente, portale, corriere, materiale, note, bolla_url, distinta_url, dettagli_url } = body

    if (!nome_cliente || !cognome_cliente || !materiale) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { data: ordine, error } = await supabase
      .from('ordini')
      .insert({ nome_cliente, cognome_cliente, telefono_cliente, portale, corriere, materiale, note, bolla_url, distinta_url, dettagli_url })
      .select()
      .single()

    if (error) throw error

    // Recupera email magazzino dalle impostazioni
    const { data: impostazioni } = await supabase
      .from('impostazioni')
      .select('chiave, valore')
      .in('chiave', ['email_magazzino', 'email_admin'])

    const emailMap = Object.fromEntries(impostazioni.map(i => [i.chiave, i.valore]))

    // Invia email a Ivan
    try {
      await inviaEmailNuovoOrdine({
        emailIvan: emailMap.email_magazzino,
        ordine,
      })
    } catch (emailErr) {
      console.error('Errore invio email:', emailErr)
      // Non blocca la creazione dell'ordine
    }

    return NextResponse.json(ordine, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
