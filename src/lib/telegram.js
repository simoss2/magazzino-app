const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ADMIN = process.env.TELEGRAM_CHAT_ADMIN
const CHAT_MAGAZZINO = process.env.TELEGRAM_CHAT_MAGAZZINO

async function sendMessage(chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.description || 'Errore Telegram')
  }
  const data = await res.json()
  return data.result.message_id
}

export async function eliminaMessaggio(chatId, messageId) {
  if (!messageId) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    })
  } catch {}
}

// Notifica a Ivan: nuovo ordine da preparare
export async function inviaNotificaNuovoOrdine({ ordine }) {
  const { numero_ordine, nome_cliente, cognome_cliente, materiale, note, portale, corriere } = ordine
  let testo = `📦 <b>Nuovo ordine #${numero_ordine}</b>\n\n`
  testo += `👤 <b>Cliente:</b> ${nome_cliente} ${cognome_cliente}\n`
  testo += `📋 <b>Materiale:</b> ${materiale}\n`
  if (portale) testo += `🛒 <b>Portale:</b> ${portale}\n`
  if (corriere) testo += `🚚 <b>Corriere:</b> ${corriere}\n`
  if (note) testo += `📝 <b>Note:</b> ${note}\n`
  testo += `\nAccedi all'app per vedere i documenti.`
  await sendMessage(CHAT_MAGAZZINO, testo)
}

// Notifica a Ivan: documento disponibile
export async function inviaNotificaDocumento({ ordine, tipoDoc }) {
  const { numero_ordine, nome_cliente, cognome_cliente } = ordine
  const nomeDoc = tipoDoc === 'bolla' ? 'Bolla di spedizione' : tipoDoc === 'distinta' ? 'Distinta' : 'Dettagli ordine'
  const emoji = tipoDoc === 'bolla' ? '📄' : tipoDoc === 'distinta' ? '📋' : '📝'
  const testo = `${emoji} <b>${nomeDoc} disponibile</b>\n\nOrdine <b>#${numero_ordine}</b> — ${nome_cliente} ${cognome_cliente}\n\nAccedi all'app per aprire e stampare il documento.`
  await sendMessage(CHAT_MAGAZZINO, testo)
}

// Notifica a Simo: Ivan ha segnato pronto — restituisce il message_id
export async function inviaNotificaPronto({ ordine }) {
  const { numero_ordine, nome_cliente, cognome_cliente, materiale } = ordine
  const testo = `✅ <b>Ordine #${numero_ordine} pronto!</b>\n\n👤 ${nome_cliente} ${cognome_cliente}\n📋 ${materiale}\n\nIvan ha completato la preparazione.`
  const messageId = await sendMessage(CHAT_ADMIN, testo)
  return messageId
}
