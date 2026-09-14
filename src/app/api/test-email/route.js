import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

// GET /api/test-email — test diretto invio email via Resend
export async function GET(request) {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to')

    // Diagnostica env vars
    const resendKey = process.env.RESEND_KEY_NEW || process.env.RESEND_API_KEY

    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY non trovata nelle env vars' }, { status: 500 })
    }

    if (!to) {
      return NextResponse.json({ error: 'Parametro ?to=email mancante' }, { status: 400 })
    }

    const resend = new Resend(resendKey)
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
      api_key_prefix: resendKey.slice(0, 10) + '...',
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      errore: err.message,
    }, { status: 500 })
  }
}
