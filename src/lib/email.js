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

function formatData(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

const LOGO_URL = 'https://magazzino-app-git-main-simo02.vercel.app/logo-doccia-store.png'

const CONTENUTI = {
  in_elaborazione: {
    it: {
      subject: 'Il tuo ordine Doccia Store è in preparazione 📦',
      badge: 'IN PREPARAZIONE',
      titolo: 'Il tuo ordine è<br>in preparazione',
      intro: 'Ciao,<br>stiamo preparando con cura il tuo ordine.<br>Riceverai un\'email appena sarà affidato al corriere.',
      grazie: 'Grazie per aver scelto DocciaStore.',
      lProd: 'Prodotti acquistati', lPortale: "Portale d'acquisto", lCorriere: 'Corriere',
      lServ: 'Servizio clienti', txtServ: 'Per qualsiasi domanda sul tuo ordine siamo a tua disposizione.',
      lCont: 'Contattaci', orari: 'Rispondiamo h24, tutti i giorni.',
      cta: 'Visita DocciaStore.com', ctaSub: 'Scopri altre soluzioni per il tuo benessere quotidiano.',
      fTag: 'La tua pausa dal mondo',
    },
    fr: {
      subject: 'Votre commande Doccia Store est en cours de préparation 📦',
      badge: 'EN PRÉPARATION',
      titolo: 'Votre commande est<br>en préparation',
      intro: "Bonjour,<br>nous préparons votre commande avec soin.<br>Vous recevrez un e-mail dès qu'elle sera confiée au transporteur.",
      grazie: "Merci d'avoir choisi DocciaStore.",
      lProd: 'Produits achetés', lPortale: "Plateforme d'achat", lCorriere: 'Transporteur',
      lServ: 'Service client', txtServ: 'Pour toute question sur votre commande, nous sommes à votre disposition.',
      lCont: 'Nous contacter', orari: 'Nous répondons h24, tous les jours.',
      cta: 'Visiter DocciaStore.com', ctaSub: "Découvrez d'autres solutions pour votre bien-être.",
      fTag: 'Votre pause dans le monde',
    },
  },
  pronto_oggi: {
    it: {
      subject: 'Il tuo ordine Doccia Store è pronto ✅',
      badge: 'PRONTO PER LA SPEDIZIONE',
      titolo: 'Il tuo ordine è pronto!',
      intro: 'Ciao,<br>ottima notizia: il tuo ordine è pronto<br>e verrà affidato al corriere a breve.',
      grazie: 'Grazie per aver scelto DocciaStore.',
      lProd: 'Prodotti acquistati', lPortale: "Portale d'acquisto", lCorriere: 'Corriere',
      lServ: 'Servizio clienti', txtServ: 'Per qualsiasi domanda sul tuo ordine siamo a tua disposizione.',
      lCont: 'Contattaci', orari: 'Rispondiamo h24, tutti i giorni.',
      cta: 'Visita DocciaStore.com', ctaSub: 'Scopri altre soluzioni per il tuo benessere quotidiano.',
      fTag: 'La tua pausa dal mondo',
    },
    fr: {
      subject: 'Votre commande Doccia Store est prête ✅',
      badge: 'PRÊTE À EXPÉDIER',
      titolo: 'Votre commande est prête !',
      intro: "Bonjour,<br>bonne nouvelle : votre commande est prête<br>et sera confiée au transporteur très prochainement.",
      grazie: "Merci d'avoir choisi DocciaStore.",
      lProd: 'Produits achetés', lPortale: "Plateforme d'achat", lCorriere: 'Transporteur',
      lServ: 'Service client', txtServ: 'Pour toute question sur votre commande, nous sommes à votre disposition.',
      lCont: 'Nous contacter', orari: 'Nous répondons h24, tous les jours.',
      cta: 'Visiter DocciaStore.com', ctaSub: "Découvrez d'autres solutions pour votre bien-être.",
      fTag: 'Votre pause dans le monde',
    },
  },
  spedito: {
    it: {
      subject: 'Il tuo ordine Doccia Store è stato spedito 🚚',
      badge: 'IN PARTENZA',
      titolo: 'Il tuo ordine è in partenza!',
      intro: 'Ciao,<br>il tuo ordine è stato spedito ed è in consegna.<br>Riceverai il codice di tracciamento a breve.',
      grazie: 'Grazie per aver scelto DocciaStore.',
      lProd: 'Prodotti acquistati', lPortale: "Portale d'acquisto", lCorriere: 'Corriere',
      lServ: 'Servizio clienti', txtServ: 'Per qualsiasi domanda sul tuo ordine siamo a tua disposizione.',
      lCont: 'Contattaci', orari: 'Rispondiamo h24, tutti i giorni.',
      cta: 'Visita DocciaStore.com', ctaSub: 'Scopri altre soluzioni per il tuo benessere quotidiano.',
      fTag: 'La tua pausa dal mondo',
    },
    fr: {
      subject: 'Votre commande Doccia Store a été expédiée 🚚',
      badge: 'EN ROUTE',
      titolo: 'Votre commande est en route !',
      intro: "Bonjour,<br>votre commande a été expédiée et est en cours de livraison.<br>Vous recevrez le numéro de suivi très prochainement.",
      grazie: "Merci d'avoir choisi DocciaStore.",
      lProd: 'Produits achetés', lPortale: "Plateforme d'achat", lCorriere: 'Transporteur',
      lServ: 'Service client', txtServ: 'Pour toute question sur votre commande, nous sommes à votre disposition.',
      lCont: 'Nous contacter', orari: 'Nous répondons h24, tous les jours.',
      cta: 'Visiter DocciaStore.com', ctaSub: "Découvrez d'autres solutions pour votre bien-être.",
      fTag: 'Votre pause dans le monde',
    },
  },
}

function buildEmail(ordine, stato) {
  const isFrancia = ordine.portale?.toLowerCase().includes('francia')
  const lang = isFrancia ? 'fr' : 'it'
  const c = CONTENUTI[stato][lang]

  const righe = (ordine.materiale || '').split('\n').filter(Boolean)
  const nProdotti = righe.length

  // Righe prodotti senza immagini
  const prodottiHtml = righe.map((r, i) => {
    const riga = isFrancia ? traduciRigaFR(r) : r
    const borderBottom = i < righe.length - 1
      ? 'border-bottom:1px solid #e0d8ce;'
      : ''
    return `
      <tr>
        <td style="padding:14px 18px;${borderBottom}">
          <p style="margin:0;font-size:14px;font-weight:700;color:#2a1206;font-family:Arial,sans-serif;">${riga}</p>
        </td>
      </tr>`
  }).join('')

  const corriereVal = (stato === 'in_elaborazione' || !ordine.corriere)
    ? (lang === 'fr' ? "En cours d'attribution" : 'In fase di assegnazione')
    : ordine.corriere

  const dataOrdine = formatData(ordine.created_at)
  const portaleVal = ordine.portale || '—'
  const numeroOrdine = ordine.numero_ordine ? `#${String(ordine.numero_ordine).padStart(5, '0')}` : '—'

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background:#ede8e0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ede8e0;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;">

    <!-- LOGO -->
    <tr>
      <td style="padding:36px 40px 0;text-align:center;">
        <img src="${LOGO_URL}" alt="Doccia Store" width="240" style="display:block;margin:0 auto 12px;height:auto;" />
        <p style="margin:0;font-size:15px;color:#5a4030;font-family:Georgia,serif;letter-spacing:.3px;">${c.fTag}</p>
        <div style="height:1px;background:#e0d8ce;margin:22px 0 0;"></div>
      </td>
    </tr>

    <!-- BADGE + TITOLO + INTRO -->
    <tr>
      <td style="padding:26px 40px 22px;text-align:center;">
        <div style="display:inline-block;background:#3d1e08;color:#ffffff;font-size:11px;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase;padding:8px 24px;border-radius:50px;font-family:Arial,sans-serif;margin-bottom:22px;">${c.badge}</div>
        <h1 style="margin:0 0 18px;font-size:26px;color:#2a1206;font-family:Georgia,serif;font-weight:normal;line-height:1.35;">${c.titolo}</h1>
        <p style="margin:0;font-size:14px;color:#5a4030;line-height:1.75;font-family:Arial,sans-serif;">${c.intro}</p>
        <div style="height:1px;background:#e0d8ce;margin:20px 0;"></div>
        <p style="margin:0;font-size:13px;color:#8a6a50;font-family:Georgia,serif;font-style:italic;">${c.grazie}</p>
      </td>
    </tr>

    <!-- STATS: prodotti / portale / corriere -->
    <tr>
      <td style="padding:0 28px 22px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0d8ce;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:16px 14px;text-align:center;border-right:1px solid #e0d8ce;width:33%;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#3d1e08;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.5px;">${c.lProd}</p>
              <p style="margin:0;font-size:20px;color:#2a1206;font-family:Georgia,serif;">${nProdotti} <span style="font-size:12px;color:#5a4030;">${lang === 'fr' ? 'articles' : 'articoli'}</span></p>
            </td>
            <td style="padding:16px 14px;text-align:center;border-right:1px solid #e0d8ce;width:33%;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#3d1e08;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.5px;">${c.lPortale}</p>
              <p style="margin:0;font-size:13px;color:#2a1206;font-family:Georgia,serif;">${portaleVal}</p>
            </td>
            <td style="padding:16px 14px;text-align:center;width:33%;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#3d1e08;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.5px;">${c.lCorriere}</p>
              <p style="margin:0;font-size:12px;color:#7a5a40;font-family:Georgia,serif;font-style:italic;line-height:1.4;">${corriereVal}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- RIEPILOGO ORDINE (numero + data) -->
    <tr>
      <td style="padding:0 28px 22px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0d8ce;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:12px 18px;border-bottom:1px solid #e0d8ce;">
              <p style="margin:0;font-size:10px;font-weight:700;color:#3d1e08;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.5px;">
                ${lang === 'fr' ? 'Récapitulatif commande' : 'Riepilogo ordine'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#8a6a50;font-family:Arial,sans-serif;padding-bottom:6px;width:140px;">
                    ${lang === 'fr' ? 'N° commande' : 'N° ordine'}
                  </td>
                  <td style="font-size:13px;color:#2a1206;font-family:Georgia,serif;font-weight:bold;padding-bottom:6px;">
                    ${numeroOrdine}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#8a6a50;font-family:Arial,sans-serif;">
                    ${lang === 'fr' ? 'Date commande' : 'Data ordine'}
                  </td>
                  <td style="font-size:13px;color:#2a1206;font-family:Georgia,serif;">
                    ${dataOrdine}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- PRODOTTI -->
    <tr>
      <td style="padding:0 28px 22px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0d8ce;border-radius:8px;overflow:hidden;">
          ${prodottiHtml}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:0 28px 8px;text-align:center;">
        <a href="https://docciastore.com" style="display:inline-block;background:#3d1e08;color:#ffffff;font-size:15px;font-family:Arial,sans-serif;font-weight:600;padding:15px 44px;border-radius:50px;text-decoration:none;">${c.cta} &#8594;</a>
        <p style="margin:12px 0 18px;font-size:12px;color:#8a6a50;font-family:Arial,sans-serif;">${c.ctaSub}</p>
      </td>
    </tr>

    <!-- DIVIDER -->
    <tr><td style="padding:0 28px;"><div style="height:1px;background:#e0d8ce;"></div></td></tr>

    <!-- SUPPORTO -->
    <tr>
      <td style="padding:20px 28px 22px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:16px;border-right:1px solid #e0d8ce;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#2a1206;font-family:Arial,sans-serif;">${c.lServ}</p>
              <p style="margin:0;font-size:12px;color:#8a6a50;font-family:Arial,sans-serif;line-height:1.6;">${c.txtServ}</p>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:16px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#2a1206;font-family:Arial,sans-serif;">${c.lCont}</p>
              <p style="margin:0 0 3px;font-size:12px;font-family:Arial,sans-serif;">
                <a href="mailto:docciastoreweb@gmail.com" style="color:#3d1e08;text-decoration:none;font-weight:600;">docciastoreweb@gmail.com</a>
              </p>
              <p style="margin:0;font-size:11px;color:#8a6a50;font-family:Arial,sans-serif;">${c.orari}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:16px 28px 28px;text-align:center;border-top:1px solid #e0d8ce;">
        <p style="margin:0 0 10px;font-size:12px;color:#8a6a50;font-family:Georgia,serif;font-style:italic;">${c.fTag}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          <tr>
            <td style="text-align:right;padding-right:10px;">
              <div style="display:inline-block;height:1px;width:70px;background:#e0d8ce;vertical-align:middle;"></div>
            </td>
            <td style="text-align:center;width:20px;">
              <div style="width:10px;height:13px;background:#3d1e08;border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;margin:0 auto;"></div>
            </td>
            <td style="text-align:left;padding-left:10px;">
              <div style="display:inline-block;height:1px;width:70px;background:#e0d8ce;vertical-align:middle;"></div>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:10px;letter-spacing:2.5px;color:#8a6a50;font-family:Arial,sans-serif;text-transform:uppercase;">
          <a href="https://docciastore.com" style="color:#8a6a50;text-decoration:none;">DOCCIASTORE.COM</a>
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`

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
