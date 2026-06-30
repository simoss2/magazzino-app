import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { inviaEmailStatoAggiornato, inviaEmailDocumentoCaricato } from '@/lib/email'

// PATCH /api/ordini/[id] — aggiorna stato o documenti
export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { stato, bolla_url, distinta_url, dettagli_url } = body

    const supabase = createSupabaseAdminClient()

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
      const { data: impostazioni } = await supabase
        .from('impostazioni')
        .select('chiave, valore')
        .eq('chiave', 'email_magazzino')

      const emailIvan = impostazioni?.[0]?.valore
      if (emailIvan) {
        const notifiche = []
        if (bolla_url && !ordineAttuale?.bolla_url) notifiche.push('bolla')
        if (distinta_url && !ordineAttuale?.distinta_url) notifiche.push('distinta')
        if (dettagli_url && !ordineAttuale?.dettagli_url) notifiche.push('dettagli')

        for (const tipoDoc of notifiche) {
          try {
            await inviaEmailDocumentoCaricato({ emailIvan, ordine, tipoDoc })
          } catch (emailErr) {
            console.error('Errore invio email documento:', emailErr)
          }
        }
      }

      return NextResponse.json(ordine)
    }

    // Aggiornamento stato
    const statiValidi = ['in_elaborazione', 'pronto_oggi', 'spedito']
    if (!statiValidi.includes(stato)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 })
    }

    const { data: ordine, error } = await supabase
      .from('ordini')
      .update({ stato })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (stato === 'pronto_oggi') {
      const { data: impostazioni } = await supabase
        .from('impostazioni')
        .select('chiave, valore')
        .eq('chiave', 'email_admin')

      const emailAdmin = impostazioni?.[0]?.valore
      if (emailAdmin) {
        try {
          await inviaEmailStatoAggiornato({ emailAdmin, ordine, nuovoStato: stato })
        } catch (emailErr) {
          console.error('Errore invio email:', emailErr)
        }
      }
    }

    return NextResponse.json(ordine)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/ordini/[id] — elimina ordine
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const supabase = createSupabaseAdminClient()

    const { error } = await supabase.from('ordini').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
