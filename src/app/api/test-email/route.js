import { NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

export async function GET(request) {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to')

    // Legge chiave da Supabase
    const supabase = createSupabaseAdminClient()
    const { data: imp } = await supabase
      .from('impostazioni')
      .select('valore')
      .eq('chiave', 'resend_api_key')
      .single()

    if (!imp?.valore) {
      return NextResponse.json({ error: 'resend_api_key non trovata in impostazioni Supabase' }, { status: 500 })
    }

    if (!to) {
      return NextResponse.json({ resend_api_key: imp.valore.slice(0, 12) + '...', status: 'trovata in Supabase' })
    }

    const resend = new Resend(imp.valore)
    const result = await resend.emails.send({
      from: 'Doccia Store <ordini@docciastore.com>',
      to,
      subject: '✅ Test email Doccia Store',
      html: '<p>Questo è un messaggio di test. Se lo ricevi, Resend funziona correttamente.</p>',
    })

    return NextResponse.json({
      success: !result?.error,
      resend_id: result?.data?.id,
      resend_error: result?.error,
      inviato_a: to,
    })
  } catch (err) {
    return NextResponse.json({ success: false, errore: err.message }, { status: 500 })
  }
}
