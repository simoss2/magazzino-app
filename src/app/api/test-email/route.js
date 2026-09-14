import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

// GET /api/test-email — test diretto invio email via Resend
// Usare solo per debug, poi eliminare
export async function GET(request) {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to')
    if (!to) return NextResponse.json({ error: 'Parametro ?to=email mancante' }, { status: 400 })

    const apiKey = process.env.RESEND_API_KEY1
    if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY1 non trovata nelle env vars' }, { status: 500 })

    const resend = new Resend(apiKey)

    const result = await resend.emails.send({
      from: 'Doccia Store <ordini@docciastore.com>',
      to,
      subject: '✅ Test email Doccia Store',
      html: '<p>Questo è un messaggio di test. Se lo ricevi, Resend funziona correttamente.</p>',
    })

    return NextResponse.json({
      success: true,
      resend_id: result?.data?.id,
      api_key_presente: !!apiKey,
      api_key_prefix: apiKey.slice(0, 8) + '...',
      inviato_a: to,
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      errore: err.message,
      stack: err.stack,
    }, { status: 500 })
  }
}
