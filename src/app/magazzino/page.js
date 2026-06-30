'use client'

import { useState, useEffect, useCallback } from 'react'

const BADGE = {
  in_elaborazione: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pronto_oggi: 'bg-green-100 text-green-800 border-green-200',
  spedito: 'bg-gray-100 text-gray-600 border-gray-200',
}

function labelStato(ordine) {
  if (ordine.stato === 'pronto_oggi') return 'Pronto oggi'
  if (ordine.stato === 'spedito') return 'Spedito'
  return 'In preparazione'
}

export default function MagazzinoPage() {
  const [ordini, setOrdini] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const [mostraSpediti, setMostraSpediti] = useState(false)

  const caricaOrdini = useCallback(async () => {
    const res = await fetch('/api/ordini')
    const data = await res.json()
    setOrdini(data)
    setCaricamento(false)
  }, [])

  useEffect(() => {
    caricaOrdini()
    const interval = setInterval(caricaOrdini, 60000)
    return () => clearInterval(interval)
  }, [caricaOrdini])

  async function aggiornaStato(id, stato, giorni_attesa) {
    const res = await fetch(`/api/ordini/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stato, giorni_attesa }),
    })
    if (res.ok) await caricaOrdini()
  }

  const ordiniAttivi = ordini.filter(o => o.stato !== 'spedito')
  const ordiniSpediti = ordini.filter(o => o.stato === 'spedito')

  return (
    <div>
      {/* Contatori */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Da preparare"
          valore={ordini.filter(o => o.stato === 'in_elaborazione').length}
          color="yellow"
        />
        <StatCard
          label="Pronti"
          valore={ordini.filter(o => o.stato === 'pronto_oggi').length}
          color="green"
        />
        <StatCard
          label="Spediti"
          valore={ordiniSpediti.length}
          color="gray"
        />
      </div>

      {caricamento ? (
        <div className="text-center py-12 text-gray-500">Caricamento ordini...</div>
      ) : ordiniAttivi.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-gray-500">Nessun ordine in attesa</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordiniAttivi.map(ordine => (
            <OrdineCardIvan
              key={ordine.id}
              ordine={ordine}
              onAggiornaStato={aggiornaStato}
            />
          ))}
        </div>
      )}

      {/* Storico spediti */}
      {ordiniSpediti.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setMostraSpediti(!mostraSpediti)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {mostraSpediti ? '▲' : '▼'} Storico spediti ({ordiniSpediti.length})
          </button>
          {mostraSpediti && (
            <div className="mt-3 space-y-2 opacity-60">
              {ordiniSpediti.map(ordine => (
                <div key={ordine.id} className="bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-mono">#{ordine.numero_ordine}</span>
                  <span>{ordine.nome_cliente} {ordine.cognome_cliente}</span>
                  <span className="text-gray-400 text-xs truncate max-w-xs">{ordine.materiale}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Spedito</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function stampaPDF(url) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;'
  iframe.src = url
  document.body.appendChild(iframe)
  iframe.onload = () => {
    try {
      iframe.contentWindow.print()
    } catch {
      window.open(url, '_blank')
    }
    setTimeout(() => document.body.removeChild(iframe), 2000)
  }
}

function DocRow({ label, url }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <div>
            <span className="text-sm font-medium text-red-700">{label} non disponibile</span>
            <p className="text-xs text-red-500 mt-0.5">Simo non ha ancora caricato questo documento</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
        <span>📄</span>
        <span>{label}</span>
      </div>
      <div className="flex gap-1.5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 text-xs border border-gray-200 rounded bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          Apri
        </a>
        <button
          onClick={() => stampaPDF(url)}
          className="px-2.5 py-1 text-xs border border-gray-200 rounded bg-white text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          🖨️ Stampa
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, valore, color }) {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  }
  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      <p className="text-3xl font-bold">{valore}</p>
      <p className="text-xs mt-1 font-medium">{label}</p>
    </div>
  )
}

function OrdineCardIvan({ ordine, onAggiornaStato }) {
  const [aggiornamento, setAggiornamento] = useState(false)

  const dataOrdine = new Date(ordine.created_at).toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })

  async function handleStato(nuovoStato) {
    setAggiornamento(true)
    await onAggiornaStato(ordine.id, nuovoStato, null)
    setAggiornamento(false)
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
      ordine.stato === 'pronto_oggi' ? 'border-green-300' : 'border-yellow-300'
    }`}>
      {/* Header card */}
      <div className={`px-5 py-3 flex items-center justify-between ${
        ordine.stato === 'pronto_oggi' ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-gray-400 text-sm">#{ordine.numero_ordine}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${BADGE[ordine.stato]}`}>
            {labelStato(ordine)}
          </span>
        </div>
        <span className="text-xs text-gray-400">{dataOrdine}</span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Cliente</p>
          <p className="font-semibold text-gray-800 text-lg">{ordine.nome_cliente} {ordine.cognome_cliente}</p>
          {ordine.telefono_cliente && (
            <p className="text-sm text-gray-500 mt-0.5">📞 {ordine.telefono_cliente}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {ordine.portale && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {ordine.portale}
              </span>
            )}
            {ordine.corriere && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                🚚 {ordine.corriere}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Materiale da preparare</p>
          <p className="text-gray-800 font-medium">{ordine.materiale}</p>
        </div>

        {ordine.note && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Note</p>
            <p className="text-amber-800 text-sm">{ordine.note}</p>
          </div>
        )}

        {/* PDF — mostrati sempre, con avviso se mancanti */}
        <div className="space-y-2 pt-1">
          <DocRow label="Bolla" url={ordine.bolla_url} />
          <DocRow label="Distinta" url={ordine.distinta_url} />
          <DocRow label="Dettagli ordine" url={ordine.dettagli_url} />
        </div>

        {/* Bottoni stato */}
        {ordine.stato !== 'spedito' && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">Aggiorna stato:</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleStato('pronto_oggi')}
                disabled={aggiornamento || ordine.stato === 'pronto_oggi'}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:cursor-default ${
                  ordine.stato === 'pronto_oggi'
                    ? 'bg-green-600 text-white opacity-100'
                    : 'bg-green-50 hover:bg-green-600 hover:text-white text-green-700 border border-green-200 disabled:opacity-50'
                }`}
              >
                {aggiornamento ? '...' : '✅ Pronto oggi'}
              </button>
              <button
                onClick={() => handleStato('in_elaborazione')}
                disabled={aggiornamento || ordine.stato === 'in_elaborazione'}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:cursor-default ${
                  ordine.stato === 'in_elaborazione'
                    ? 'bg-yellow-400 text-white opacity-100'
                    : 'bg-yellow-50 hover:bg-yellow-400 hover:text-white text-yellow-700 border border-yellow-200 disabled:opacity-50'
                }`}
              >
                {aggiornamento ? '...' : '🔄 In preparazione'}
              </button>
            </div>
            {ordine.stato === 'pronto_oggi' && (
              <p className="text-xs text-green-600 mt-2">✅ Simo è stato avvisato.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
