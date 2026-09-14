import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY1)

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

function emailTemplate({ titolo, saluto, intro, prodottiHtml, chiusura, firma, isFrancia }) {
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
              🚚 ${isFrancia ? 'Votre commande est en route !' : 'Il tuo ordine è in partenza!'}
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
                    📧 <a href="mailto:docciastoreweb@gmail.com" style="color:#c9956a;text-decoration:none;">docciastoreweb@gmail.com</a><br/>
                    📧 <a href="mailto:simone.docciastore@gmail.com" style="color:#c9956a;text-decoration:none;">simone.docciastore@gmail.com</a>
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

function buildEmailIT(ordine) {
  const prodottiHtml = ordine.materiale
    .split('\n').filter(Boolean)
    .map(r => `<p style="margin:0 0 6px;font-size:14px;color:#3d1e08;">• ${r}</p>`)
    .join('')

  const html = emailTemplate({
    titolo: 'Il tuo ordine è stato spedito — Doccia Store',
    saluto: `Gentile ${ordine.nome_cliente} ${ordine.cognome_cliente},`,
    intro: `Le comunichiamo con piacere che il Suo ordine è stato <strong style="color:#3d1e08;">spedito</strong> e sarà presto in consegna. Di seguito il riepilogo degli articoli:`,
    prodottiHtml,
    chiusura: `Riceverà il codice di tracciamento non appena disponibile. Per qualsiasi informazione, non esiti a contattarci — siamo sempre a Sua disposizione.`,
    firma: `Grazie per aver scelto Doccia Store`,
    isFrancia: false,
  })

  return { subject: `Il tuo ordine Doccia Store è stato spedito 🚚`, html }
}

function buildEmailFR(ordine) {
  const prodottiHtml = ordine.materiale
    .split('\n').filter(Boolean)
    .map(r => `<p style="margin:0 0 6px;font-size:14px;color:#3d1e08;">• ${traduciRigaFR(r)}</p>`)
    .join('')

  const html = emailTemplate({
    titolo: 'Votre commande a été expédiée — Doccia Store',
    saluto: `Cher(e) ${ordine.nome_cliente} ${ordine.cognome_cliente},`,
    intro: `Nous avons le plaisir de vous informer que votre commande a été <strong style="color:#3d1e08;">expédiée</strong> et sera bientôt livrée. Voici le récapitulatif de vos articles :`,
    prodottiHtml,
    chiusura: `Vous recevrez le numéro de suivi dès qu'il sera disponible. Pour toute question, n'hésitez pas à nous contacter — nous sommes à votre entière disposition.`,
    firma: `Merci d'avoir choisi Doccia Store`,
    isFrancia: true,
  })

  return { subject: `Votre commande Doccia Store a été expédiée 🚚`, html }
}

export async function inviaEmailSpedizione(ordine) {
  if (!ordine.email_cliente) return

  const isFrancia = ordine.portale?.toLowerCase().includes('francia')
  const { subject, html } = isFrancia ? buildEmailFR(ordine) : buildEmailIT(ordine)

  try {
    await resend.emails.send({
      from: 'Doccia Store <ordini@docciastore.com>',
      to: ordine.email_cliente,
      subject,
      html,
    })
    console.log('Email spedizione inviata a:', ordine.email_cliente)
  } catch (err) {
    console.error('Errore invio email spedizione:', err)
  }
}
