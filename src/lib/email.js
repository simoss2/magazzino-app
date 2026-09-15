import { Resend } from 'resend'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

async function getResend() {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('impostazioni')
    .select('valore')
    .eq('chiave', 'resend_api_key')
    .single()
  if (!data?.valore) throw new Error('Resend API key non trovata in impostazioni')
  return new Resend(data.valore)
}

const TRADUZIONI_FR = {
  'Box doccia':    'Cabine de douche',
  'Walk-in':       'Paroi de douche walk-in',
  'Piatto doccia': 'Receveur de douche',
  'Altro':         'Autre',
}
const COLORI_FR = { grigio: 'gris', bianco: 'blanc', creta: 'craie', nero: 'noir' }

function traduciRigaFR(riga) {
  let r = riga.replace(/^(\d+x )([\w\- ]+)( — )/, (_, qty, tipo, sep) => {
    return `${qty}${TRADUZIONI_FR[tipo.trim()] || tipo.trim()}${sep}`
  })
  Object.entries(COLORI_FR).forEach(([it, fr]) => {
    r = r.replace(new RegExp(`\\b${it}\\b`, 'gi'), fr)
  })
  return r
}

function emailTemplate({ titolo, saluto, intro, prodottiHtml, chiusura, firma, banner, isFrancia }) {
  return `<!DOCTYPE html>
<html lang="${isFrancia ? 'fr' : 'it'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titolo}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#3d1e08;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#c9956a;text-transform:uppercase;font-family:Arial,sans-serif;">
              ${isFrancia ? 'Douche & Design' : 'Doccia & Design'}
            </p>
            <h1 style="margin:0;font-size:28px;color:#ffffff;font-family:Georgia,serif;font-weight:normal;letter-spacing:1px;">
              Doccia Store
            </h1>
            <div style="width:40px;height:2px;background:#c9956a;margin:12px auto 0;"></div>
          </td>
        </tr>

        <!-- Banner spedizione -->
        <tr>
          <td style="background:#c9956a;padding:14px 40px;text-align:center;">
            <p style="margin:0;color:#3d1e08;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">
              ${banner}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="margin:0 0 20px;font-size:16px;color:#3d1e08;">${saluto}</p>
            <p style="margin:0 0 28px;font-size:15px;color:#5a4030;line-height:1.7;">${intro}</p>

            <!-- Prodotti -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#f9f4ef;border-left:3px solid #c9956a;border-radius:0 8px 8px 0;padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#c9956a;text-transform:uppercase;font-family:Arial,sans-serif;">
                    ${isFrancia ? 'Articles commandés' : 'Articoli ordinati'}
                  </p>
                  ${prodottiHtml}
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:15px;color:#5a4030;line-height:1.7;">${chiusura}</p>

            <!-- Contatti -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8ddd5;padding-top:24px;margin-top:8px;">
              <tr>
                <td>
                  <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;color:#c9956a;text-transform:uppercase;font-family:Arial,sans-serif;">
                    ${isFrancia ? 'Besoin d\'aide ?' : 'Hai bisogno di aiuto?'}
                  </p>
                  <p style="margin:0;font-size:14px;color:#5a4030;line-height:1.8;">
                    📧 <a href="mailto:docciastoreweb@gmail.com" style="color:#c9956a;text-decoration:none;">docciastoreweb@gmail.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#3d1e08;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#c9956a;font-family:Georgia,serif;">${firma}</p>
            <p style="margin:0;font-size:11px;color:#8a6a50;font-family:Arial,sans-serif;">
              © ${new Date().getFullYear()} Doccia Store · docciastore.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const CONTENUTI = {
  in_elaborazione: {
    it: {
      banner: '📦 Il tuo ordine è in preparazione',
      titolo: 'Il tuo ordine è in preparazione — Doccia Store',
      subject: 'Il tuo ordine Doccia Store è in preparazione 📦',
      intro: `Abbiamo preso in carico il Suo ordine e il nostro team è al lavoro per prepararlo. Di seguito il riepilogo degli articoli:`,
      chiusura: `La aggiorneremo non appena l'ordine sarà pronto per la spedizione. Per qualsiasi informazione, non esiti a contattarci.`,
    },
    fr: {
      banner: '📦 Votre commande est en cours de préparation',
      titolo: 'Votre commande est en cours de préparation — Doccia Store',
      subject: 'Votre commande Doccia Store est en cours de préparation 📦',
      intro: `Nous avons bien pris en charge votre commande et notre équipe travaille à sa préparation. Voici le récapitulatif de vos articles :`,
      chiusura: `Nous vous tiendrons informé(e) dès que votre commande sera prête à être expédiée. N'hésitez pas à nous contacter pour toute question.`,
    },
  },
  pronto_oggi: {
    it: {
      banner: '✅ Il tuo ordine è pronto per la spedizione',
      titolo: 'Il tuo ordine è pronto — Doccia Store',
      subject: 'Il tuo ordine Doccia Store è pronto ✅',
      intro: `Ottima notizia! Il Suo ordine è stato preparato ed è <strong style="color:#3d1e08;">pronto per essere spedito</strong>. Di seguito il riepilogo degli articoli:`,
      chiusura: `Riceverà a breve una conferma di spedizione con il codice di tracciamento. Per qualsiasi informazione, siamo a Sua disposizione.`,
    },
    fr: {
      banner: '✅ Votre commande est prête à être expédiée',
      titolo: 'Votre commande est prête — Doccia Store',
      subject: 'Votre commande Doccia Store est prête ✅',
      intro: `Bonne nouvelle ! Votre commande a été préparée et est <strong style="color:#3d1e08;">prête à être expédiée</strong>. Voici le récapitulatif de vos articles :`,
      chiusura: `Vous recevrez prochainement une confirmation d'expédition avec le numéro de suivi. Nous restons à votre disposition.`,
    },
  },
  spedito: {
    it: {
      banner: '🚚 Il tuo ordine è in partenza!',
      titolo: 'Il tuo ordine è stato spedito — Doccia Store',
      subject: 'Il tuo ordine Doccia Store è stato spedito 🚚',
      intro: `Le comunichiamo con piacere che il Suo ordine è stato <strong style="color:#3d1e08;">spedito</strong> ed è in consegna. Di seguito il riepilogo degli articoli:`,
      chiusura: `Riceverà il codice di tracciamento non appena disponibile. Per qualsiasi informazione, non esiti a contattarci — siamo sempre a Sua disposizione.`,
    },
    fr: {
      banner: '🚚 Votre commande est en route !',
      titolo: 'Votre commande a été expédiée — Doccia Store',
      subject: 'Votre commande Doccia Store a été expédiée 🚚',
      intro: `Nous avons le plaisir de vous informer que votre commande a été <strong style="color:#3d1e08;">expédiée</strong> et est en cours de livraison. Voici le récapitulatif de vos articles :`,
      chiusura: `Vous recevrez le numéro de suivi dès qu'il sera disponible. Pour toute question, n'hésitez pas à nous contacter — nous sommes à votre entière disposition.`,
    },
  },
}

function buildEmail(ordine, stato) {
  const isFrancia = ordine.portale?.toLowerCase().includes('francia')
  const lang = isFrancia ? 'fr' : 'it'
  const c = CONTENUTI[stato][lang]

  const prodottiHtml = ordine.materiale
    .split('\n').filter(Boolean)
    .map(r => {
      const riga = isFrancia ? traduciRigaFR(r) : r
      return `<p style="margin:0 0 6px;font-size:14px;color:#3d1e08;">• ${riga}</p>`
    })
    .join('')

  const saluto = isFrancia
    ? `Cher(e) ${ordine.nome_cliente} ${ordine.cognome_cliente},`
    : `Gentile ${ordine.nome_cliente} ${ordine.cognome_cliente},`

  const firma = isFrancia ? `Merci d'avoir choisi Doccia Store` : `Grazie per aver scelto Doccia Store`

  const html = emailTemplate({
    titolo: c.titolo,
    saluto,
    intro: c.intro,
    prodottiHtml,
    chiusura: c.chiusura,
    firma,
    banner: c.banner,
    isFrancia,
  })

  return { subject: c.subject, html }
}

export async function inviaEmailStato(ordine, stato) {
  if (!ordine.email_cliente) return
  if (!CONTENUTI[stato]) return

  const { subject, html } = buildEmail(ordine, stato)

  try {
    const resend = await getResend()
    await resend.emails.send({
      from: 'Doccia Store <ordini@docciastore.com>',
      to: ordine.email_cliente,
      subject,
      html,
    })
    console.log(`Email stato "${stato}" inviata a:`, ordine.email_cliente)
  } catch (err) {
    console.error('Errore invio email:', err)
  }
}
