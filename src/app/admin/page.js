'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const STATI = {
  in_elaborazione: { label: 'In preparazione', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  pronto_oggi:     { label: 'Pronto oggi',      color: 'bg-green-100 text-green-800 border-green-200' },
  spedito:         { label: 'Spedito',          color: 'bg-gray-100 text-gray-600 border-gray-200' },
}

function labelStato(ordine) {
  if (ordine.stato === 'pronto_oggi') return 'Pronto oggi'
  if (ordine.stato === 'spedito') return 'Spedito'
  return 'In preparazione'
}

const DOC_LABELS = { bolla: 'Bolla', distinta: 'Distinta', dettagli: 'Dettagli' }

function docMancanti(ordine) {
  const mancanti = []
  if (!ordine.bolla_url) mancanti.push('bolla')
  if (!ordine.distinta_url) mancanti.push('distinta')
  if (!ordine.dettagli_url) mancanti.push('dettagli')
  return mancanti
}

export default function AdminDashboard() {
  const [ordini, setOrdini] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const [filtroStato, setFiltroStato] = useState('tutti')
  const [aggiornamento, setAggiornamento] = useState(null)

  const caricaOrdini = useCallback(async () => {
    const url = filtroStato === 'tutti' ? '/api/ordini' : `/api/ordini?stato=${filtroStato}`
    const res = await fetch(url)
    const data = await res.json()
    setOrdini(data)
    setCaricamento(false)
  }, [filtroStato])

  useEffect(() => { caricaOrdini() }, [caricaOrdini])

  async function segnaSpedito(id) {
    setAggiornamento(id)
    await fetch(`/api/ordini/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stato: 'spedito' }),
    })
    await caricaOrdini()
    setAggiornamento(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ordini</h1>
        <div className="flex gap-2 flex-wrap">
          {['tutti', 'in_elaborazione', 'pronto_oggi', 'spedito'].map(s => (
            <button
              key={s}
              onClick={() => { setFiltroStato(s); setCaricamento(true) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroStato === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {s === 'tutti' ? 'Tutti' : STATI[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {caricamento ? (
        <div className="text-center py-12 text-gray-500">Caricamento...</div>
      ) : ordini.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-lg">Nessun ordine trovato</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordini.map(ordine => (
            <OrdineCard
              key={ordine.id}
              ordine={ordine}
              onSegnaSpedito={segnaSpedito}
              aggiornamento={aggiornamento}
              onAggiornato={caricaOrdini}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrdineCard({ ordine, onSegnaSpedito, aggiornamento, onAggiornato }) {
  const [aperto, setAperto] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const stato = STATI[ordine.stato] || STATI.in_elaborazione

  async function handleElimina(e) {
    e.stopPropagation()
    if (!confirm(`Eliminare l'ordine #${ordine.numero_ordine} di ${ordine.nome_cliente} ${ordine.cognome_cliente}? L'azione è irreversibile.`)) return
    setEliminando(true)
    await fetch(`/api/ordini/${ordine.id}`, { method: 'DELETE' })
    await onAggiornato()
  }
  const mancanti = docMancanti(ordine)
  const dataOrdine = new Date(ordine.created_at).toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border ${
      mancanti.length > 0 ? 'border-red-200' : 'border-gray-200'
    }`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setAperto(!aperto)}
      >
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-mono text-sm">#{ordine.numero_ordine}</span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{ordine.nome_cliente} {ordine.cognome_cliente}</p>
              {ordine.portale && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {ordine.portale}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate max-w-xs">{ordine.materiale}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {mancanti.length > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
              ⚠ {mancanti.map(m => DOC_LABELS[m]).join(', ')} mancante{mancanti.length > 1 ? '' : ''}
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stato.color}`}>
            {labelStato(ordine)}
          </span>
          <span className="text-gray-400 text-sm">{aperto ? '▲' : '▼'}</span>
        </div>
      </div>

      {aperto && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Materiale</p>
              <p className="text-gray-800">{ordine.materiale}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Ricevuto</p>
              <p className="text-gray-800">{dataOrdine}</p>
            </div>
            {ordine.telefono_cliente && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Telefono</p>
                <p className="text-gray-800">{ordine.telefono_cliente}</p>
              </div>
            )}
            {ordine.portale && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Portale</p>
                <p className="text-gray-800">{ordine.portale}</p>
              </div>
            )}
            {ordine.corriere && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Corriere</p>
                <p className="text-gray-800">{ordine.corriere}</p>
              </div>
            )}
            {ordine.note && (
              <div className="col-span-2">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Note</p>
                <p className="text-gray-800">{ordine.note}</p>
              </div>
            )}
          </div>

          {/* Documenti */}
          <div className="space-y-2">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Documenti</p>
            <DocRowAdmin
              label="Bolla"
              url={ordine.bolla_url}
              ordineId={ordine.id}
              tipo="bolla"
              onAggiornato={onAggiornato}
            />
            <DocRowAdmin
              label="Distinta"
              url={ordine.distinta_url}
              ordineId={ordine.id}
              tipo="distinta"
              onAggiornato={onAggiornato}
            />
            <DocRowAdmin
              label="Dettagli ordine"
              url={ordine.dettagli_url}
              ordineId={ordine.id}
              tipo="dettagli"
              onAggiornato={onAggiornato}
            />
          </div>

          {/* Azione spedito */}
          {(ordine.stato === 'pronto_oggi' || ordine.stato === 'pronto_tra_giorni') && (
            <div className="pt-1">
              <button
                onClick={() => onSegnaSpedito(ordine.id)}
                disabled={aggiornamento === ordine.id}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {aggiornamento === ordine.id ? 'Aggiornamento...' : '✅ Segna come spedito'}
              </button>
            </div>
          )}

          {/* Elimina ordine */}
          <div className="pt-1 border-t border-red-100">
            <button
              onClick={handleElimina}
              disabled={eliminando}
              className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {eliminando ? 'Eliminando...' : '🗑 Elimina ordine'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DocRowAdmin({ label, url, ordineId, tipo, onAggiornato }) {
  const [caricamento, setCaricamento] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setCaricamento(true)

    try {
      // Upload file
      const fd = new FormData()
      fd.append('file', file)
      fd.append('tipo', tipo)
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const upData = await upRes.json()
      if (!upRes.ok) throw new Error(upData.error)

      // Aggiorna ordine
      await fetch(`/api/ordini/${ordineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [`${tipo}_url`]: upData.url }),
      })

      await onAggiornato()
    } catch (err) {
      alert('Errore durante il caricamento: ' + err.message)
    } finally {
      setCaricamento(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${
      url
        ? 'bg-white border-gray-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        {url ? (
          <span className="text-green-500 text-sm">📄</span>
        ) : (
          <span className="text-red-500 text-sm">⚠️</span>
        )}
        <span className={`text-sm font-medium ${url ? 'text-gray-700' : 'text-red-700'}`}>
          {label}
          {!url && <span className="font-normal"> — non caricata</span>}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-xs border border-gray-200 rounded bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            Apri
          </a>
        )}
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={caricamento}
          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
            url
              ? 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'
              : 'bg-red-600 hover:bg-red-700 text-white border-0'
          } disabled:opacity-50`}
        >
          {caricamento ? '...' : url ? 'Sostituisci' : 'Carica ora'}
        </button>
      </div>
    </div>
  )
}
