import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { inviaNotificaNuovoOrdine } from '@/lib/telegram'

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

    // Calcola il prossimo numero_ordine senza buchi
    const { data: maxData } = await supabase
      .from('ordini')
      .select('numero_ordine')
      .order('numero_ordine', { ascending: false })
      .limit(1)
      .single()

    const nextNumero = (maxData?.numero_ordine || 0) + 1

    const { data: ordine, error } = await supabase
      .from('ordini')
      .insert({ numero_ordine: nextNumero, nome_cliente, cognome_cliente, telefono_cliente, portale, corriere, materiale, note, bolla_url, distinta_url, dettagli_url })
      .select()
      .single()

    if (error) throw error

    // Notifica Telegram a Ivan
    try {
      await inviaNotificaNuovoOrdine({ ordine })
    } catch (tgErr) {
      console.error('Errore notifica Telegram:', tgErr)
    }

    return NextResponse.json(ordine, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
