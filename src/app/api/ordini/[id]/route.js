import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { inviaNotificaPronto, inviaNotificaDocumento, eliminaMessaggio } from '@/lib/telegram'

// PATCH /api/ordini/[id] — aggiorna stato o documenti
export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { stato, bolla_url, distinta_url, dettagli_url, nome_cliente, cognome_cliente, telefono_cliente, portale, corriere, materiale, note } = body

    const supabase = createSupabaseAdminClient()

    // Aggiornamento dati anagrafici (senza notifiche)
    if (nome_cliente !== undefined || cognome_cliente !== undefined || telefono_cliente !== undefined || portale !== undefined || corriere !== undefined || materiale !== undefined || note !== undefined) {
      const aggiornamento = {}
      if (nome_cliente !== undefined) aggiornamento.nome_cliente = nome_cliente
      if (cognome_cliente !== undefined) aggiornamento.cognome_cliente = cognome_cliente
      if (telefono_cliente !== undefined) aggiornamento.telefono_cliente = telefono_cliente
      if (portale !== undefined) aggiornamento.portale = portale
      if (corriere !== undefined) aggiornamento.corriere = corriere
      if (materiale !== undefined) aggiornamento.materiale = materiale
      if (note !== undefined) aggiornamento.note = note

      const { data: ordine, error } = await supabase
        .from('ordini')
        .update(aggiornamento)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(ordine)
    }

    // Aggiornamento documenti (senza cambio stato)
    if (bolla_url !== undefined || distinta_url !== undefined || dettagli_url !== undefined) {
      // Legge l'ordine attuale per sapere quali doc erano mancanti
      const { data: ordineAttuale } = await supabase
        .from('ordini')
        .select('bolla_url, distinta_url, dettagli_url')
        .eq('id', id)
        .single()

      const aggiornamento = {}
      if (bolla_url !== undefined) aggiornamento.bolla_url = bolla_url
      if (distinta_url !== undefined) aggiornamento.distinta_url = distinta_url
      if (dettagli_url !== undefined) aggiornamento.dettagli_url = dettagli_url

      const { data: ordine, error } = await supabase
        .from('ordini')
        .update(aggiornamento)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Notifica Ivan solo se il documento era assente prima
      const notifiche = []
      if (bolla_url && !ordineAttuale?.bolla_url) notifiche.push('bolla')
      if (distinta_url && !ordineAttuale?.distinta_url) notifiche.push('distinta')
      if (dettagli_url && !ordineAttuale?.dettagli_url) notifiche.push('dettagli')

      for (const tipoDoc of notifiche) {
        try {
          await inviaNotificaDocumento({ ordine, tipoDoc })
        } catch (tgErr) {
          console.error('Errore notifica Telegram documento:', tgErr)
        }
      }

      return NextResponse.json(ordine)
    }

    // Aggiornamento stato
    const statiValidi = ['in_elaborazione', 'pronto_oggi', 'bollettato', 'spedito']
    if (!statiValidi.includes(stato)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 })
    }

    // Legge l'ordine attuale per recuperare telegram_message_id se presente
    const { data: ordineAttuale } = await supabase
      .from('ordini')
      .select('telegram_message_id')
      .eq('id', id)
      .single()

    const aggiornamentoStato = { stato }

    if (stato === 'spedito') {
      aggiornamentoStato.data_spedizione = new Date().toISOString()
    } else {
      aggiornamentoStato.data_spedizione = null
    }

    if (stato === 'pronto_oggi') {
      try {
        const { data: ordineCompleto } = await supabase.from('ordini').select('*').eq('id', id).single()
        const msgId = await inviaNotificaPronto({ ordine: ordineCompleto })
        aggiornamentoStato.telegram_message_id = msgId
      } catch (tgErr) {
        console.error('Errore notifica Telegram:', tgErr)
      }
    }

    if (stato === 'in_elaborazione' && ordineAttuale?.telegram_message_id) {
      try {
        await eliminaMessaggio(process.env.TELEGRAM_CHAT_ADMIN, ordineAttuale.telegram_message_id)
        aggiornamentoStato.telegram_message_id = null
      } catch (tgErr) {
        console.error('Errore eliminazione messaggio Telegram:', tgErr)
      }
    }

    const { data: ordine, error } = await supabase
      .from('ordini')
      .update(aggiornamentoStato)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(ordine)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/ordini/[id] — elimina ordine e messaggi Telegram collegati
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseAdminClient()

    // Legge i message_id prima di eliminare
    const { data: ordine } = await supabase
      .from('ordini')
      .select('telegram_ivan_message_id, telegram_message_id')
      .eq('id', id)
      .single()

    // Elimina messaggio a Ivan (notifica nuovo ordine)
    if (ordine?.telegram_ivan_message_id) {
      try {
        await eliminaMessaggio(process.env.TELEGRAM_CHAT_MAGAZZINO, ordine.telegram_ivan_message_id)
      } catch {}
    }

    // Elimina eventuale messaggio a Simo (notifica pronto)
    if (ordine?.telegram_message_id) {
      try {
        await eliminaMessaggio(process.env.TELEGRAM_CHAT_ADMIN, ordine.telegram_message_id)
      } catch {}
    }

    const { error } = await supabase.from('ordini').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
