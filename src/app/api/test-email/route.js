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
    const keyNew = process.env.RESEND_KEY_NEW
    const keyOld = process.env.RESEND_API_KEY
    const resendKey = keyNew || keyOld

    if (!resendKey) {
      return NextResponse.json({ error: 'Nessuna chiave Resend trovata' }, { status: 500 })
    }

    const tutteLeVars = Object.keys(process.env)
      .filter(k => k.toLowerCase().includes('resend'))

    if (!to) {
      return NextResponse.json({
        RESEND_KEY_NEW: keyNew ? keyNew.slice(0, 12) + '...' : 'NON TROVATA',
        RESEND_API_KEY: keyOld ? keyOld.slice(0, 12) + '...' : 'NON TROVATA',
        usa: keyNew ? 'RESEND_KEY_NEW' : 'RESEND_API_KEY',
        nomi_variabili_resend: tutteLeVars,
      })
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
      variabile_usata: keyNew ? 'RESEND_KEY_NEW' : 'RESEND_API_KEY',
      api_key_prefix: resendKey.slice(0, 12) + '...',
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      errore: err.message,
    }, { status: 500 })
  }
}
