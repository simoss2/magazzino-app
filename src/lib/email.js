import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Magazzino <onboarding@resend.dev>'

// Notifica a Ivan: nuovo ordine da preparare
export async function inviaEmailNuovoOrdine({ emailIvan, ordine }) {
  const { numero_ordine, nome_cliente, cognome_cliente, materiale, note } = ordine

  await resend.emails.send({
    from: FROM,
    to: emailIvan,
    subject: `📦 Nuovo ordine #${numero_ordine} da preparare`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Nuovo ordine da preparare</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #555;">N° Ordine</td>
            <td style="padding: 8px;">#${numero_ordine}</td>
          </tr>
          <tr style="background:#f8f8f8">
            <td style="padding: 8px; font-weight: bold; color: #555;">Cliente</td>
            <td style="padding: 8px;">${nome_cliente} ${cognome_cliente}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #555;">Materiale</td>
            <td style="padding: 8px;">${materiale}</td>
          </tr>
          ${note ? `
          <tr style="background:#f8f8f8">
            <td style="padding: 8px; font-weight: bold; color: #555;">Note</td>
            <td style="padding: 8px;">${note}</td>
          </tr>` : ''}
        </table>
        <p style="margin-top: 24px; color: #555;">
          Bolla e distinta disponibili nell'app. Accedi e aggiorna lo stato quando sei pronto.
        </p>
        <p style="color: #999; font-size: 12px;">Sistema Magazzino</p>
      </div>
    `,
  })
}

// Notifica a Ivan: documento (bolla o distinta) ora disponibile
export async function inviaEmailDocumentoCaricato({ emailIvan, ordine, tipoDoc }) {
  const { numero_ordine, nome_cliente, cognome_cliente, materiale } = ordine
  const nomeDoc = tipoDoc === 'bolla' ? 'Bolla di spedizione' : tipoDoc === 'distinta' ? 'Distinta' : 'Dettagli ordine'
  const emoji = tipoDoc === 'bolla' ? '📄' : tipoDoc === 'distinta' ? '📋' : '📝'

  await resend.emails.send({
    from: FROM,
    to: emailIvan,
    subject: `${emoji} ${nomeDoc} disponibile — Ordine #${numero_ordine}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">${nomeDoc} ora disponibile</h2>
        <p style="font-size: 16px; color: #333;">
          È stata caricata la <strong>${nomeDoc.toLowerCase()}</strong> per l'ordine <strong>#${numero_ordine}</strong>.
        </p>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #555;">N° Ordine</td>
            <td style="padding: 8px;">#${numero_ordine}</td>
          </tr>
          <tr style="background:#f8f8f8">
            <td style="padding: 8px; font-weight: bold; color: #555;">Cliente</td>
            <td style="padding: 8px;">${nome_cliente} ${cognome_cliente}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #555;">Materiale</td>
            <td style="padding: 8px;">${materiale}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; color: #555;">
          Accedi all'app per aprire e stampare il documento.
        </p>
        <p style="color: #999; font-size: 12px;">Sistema Magazzino</p>
      </div>
    `,
  })
}

// Notifica a Simo: Ivan ha aggiornato lo stato
export async function inviaEmailStatoAggiornato({ emailAdmin, ordine, nuovoStato }) {
  const { numero_ordine, nome_cliente, cognome_cliente, materiale } = ordine

  const statoLabel = '✅ Pronto oggi'

  await resend.emails.send({
    from: FROM,
    to: emailAdmin,
    subject: `${statoLabel} — Ordine #${numero_ordine}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Aggiornamento ordine #${numero_ordine}</h2>
        <p style="font-size: 18px;">
          Ivan ha aggiornato lo stato: <strong>${statoLabel}</strong>
        </p>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #555;">Cliente</td>
            <td style="padding: 8px;">${nome_cliente} ${cognome_cliente}</td>
          </tr>
          <tr style="background:#f8f8f8">
            <td style="padding: 8px; font-weight: bold; color: #555;">Materiale</td>
            <td style="padding: 8px;">${materiale}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; color: #555;">
          Puoi procedere con la preparazione della spedizione.
        </p>
        <p style="color: #999; font-size: 12px;">Sistema Magazzino</p>
      </div>
    `,
  })
}
