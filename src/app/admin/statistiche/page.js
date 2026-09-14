'use client'

import { useState, useEffect } from 'react'

function StatCard({ label, valore, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
    green: 'bg-green-50 border-green-100 text-green-800',
    purple: 'bg-purple-50 border-purple-100 text-purple-800',
    orange: 'bg-orange-50 border-orange-100 text-orange-800',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-bold">{valore}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

function BarRow({ label, valore, max, color = 'bg-blue-400' }) {
  const pct = max > 0 ? Math.round((valore / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-36 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8 text-right">{valore}</span>
    </div>
  )
}

export default function StatistichePage() {
  const [ordini, setOrdini] = useState([])
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    fetch('/api/ordini')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrdini(data); setCaricamento(false) })
      .catch(() => setCaricamento(false))
  }, [])

  if (caricamento) return <div className="text-gray-400 py-12 text-center">Caricamento statistiche...</div>

  const totale = ordini.length
  const spediti = ordini.filter(o => o.stato === 'spedito').length
  const attivi = ordini.filter(o => !['spedito', 'sospeso'].includes(o.stato)).length
  const sospesi = ordini.filter(o => o.stato === 'sospeso').length

  // Tempo medio dal nuovo allo spedito (in giorni)
  const speditiConDate = ordini.filter(o => o.stato === 'spedito' && o.data_nuovo && o.data_spedizione)
  const tempoMedio = speditiConDate.length > 0
    ? Math.round(speditiConDate.reduce((acc, o) => {
        return acc + (new Date(o.data_spedizione) - new Date(o.data_nuovo)) / (1000 * 60 * 60 * 24)
      }, 0) / speditiConDate.length)
    : null

  // Ordini per mese (ultimi 6 mesi)
  const mesi = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i)
    const anno = d.getFullYear(); const mese = d.getMonth()
    const label = d.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })
    const count = ordini.filter(o => {
      const od = new Date(o.created_at)
      return od.getFullYear() === anno && od.getMonth() === mese
    }).length
    mesi.push({ label, count })
  }
  const maxMese = Math.max(...mesi.map(m => m.count), 1)

  // Per portale
  const portaliMap = {}
  ordini.forEach(o => {
    const p = o.portale || 'Non specificato'
    portaliMap[p] = (portaliMap[p] || 0) + 1
  })
  const portaliSorted = Object.entries(portaliMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxPortale = Math.max(...portaliSorted.map(p => p[1]), 1)

  // Per stato corrente
  const statiLabels = {
    nuovo: 'Nuovi', in_elaborazione: 'In preparazione',
    pronto_oggi: 'Pronti oggi', bollettato: 'Bollettati',
    spedito: 'Spediti', sospeso: 'Sospesi',
  }
  const statiColors = {
    nuovo: 'bg-purple-400', in_elaborazione: 'bg-yellow-400',
    pronto_oggi: 'bg-green-400', bollettato: 'bg-blue-400',
    spedito: 'bg-gray-400', sospeso: 'bg-orange-400',
  }
  const perStato = Object.entries(statiLabels).map(([k, l]) => ({
    label: l, valore: ordini.filter(o => o.stato === k).length, color: statiColors[k],
  }))
  const maxStato = Math.max(...perStato.map(s => s.valore), 1)

  // Prodotti più venduti
  const prodottiMap = {}
  ordini.forEach(o => {
    if (!o.materiale) return
    o.materiale.split('\n').filter(Boolean).forEach(riga => {
      const match = riga.match(/^(\d+)x ([^—]+) — (.+)$/)
      if (match) {
        const qty = parseInt(match[1])
        const nome = `${match[2].trim()} — ${match[3].trim()}`
        prodottiMap[nome] = (prodottiMap[nome] || 0) + qty
      } else {
        prodottiMap[riga.trim()] = (prodottiMap[riga.trim()] || 0) + 1
      }
    })
  })
  const prodottiSorted = Object.entries(prodottiMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxProdotto = Math.max(...prodottiSorted.map(p => p[1]), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Statistiche</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Totale ordini" valore={totale} color="blue" />
        <StatCard label="Attivi" valore={attivi} sub="in lavorazione" color="green" />
        <StatCard label="Spediti" valore={spediti} sub={`${totale > 0 ? Math.round(spediti/totale*100) : 0}% del totale`} color="purple" />
        <StatCard
          label="Tempo medio evasione"
          valore={tempoMedio !== null ? `${tempoMedio}g` : '—'}
          sub="dal ricevimento alla spedizione"
          color="orange"
        />
      </div>

      {/* Per mese */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Ordini per mese</h2>
        <div className="space-y-3">
          {mesi.map(m => (
            <BarRow key={m.label} label={m.label} valore={m.count} max={maxMese} color="bg-blue-400" />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Per portale */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Per portale</h2>
          <div className="space-y-3">
            {portaliSorted.map(([p, v]) => (
              <BarRow key={p} label={p} valore={v} max={maxPortale} color="bg-purple-400" />
            ))}
            {portaliSorted.length === 0 && <p className="text-sm text-gray-400">Nessun dato</p>}
          </div>
        </div>

        {/* Per stato */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Per stato attuale</h2>
          <div className="space-y-3">
            {perStato.map(s => (
              <BarRow key={s.label} label={s.label} valore={s.valore} max={maxStato} color={s.color} />
            ))}
          </div>
        </div>
      </div>

      {/* Prodotti più venduti */}
      {prodottiSorted.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Prodotti più venduti</h2>
          <div className="space-y-3">
            {prodottiSorted.map(([nome, qty]) => (
              <BarRow key={nome} label={nome} valore={qty} max={maxProdotto} color="bg-teal-400" />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Basato sulle quantità totali ordinate</p>
        </div>
      )}

      {sospesi > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-700">
            ⏸ <strong>{sospesi} ordine{sospesi > 1 ? 'i' : ''} sospeso{sospesi > 1 ? 'i' : ''}</strong> — ricordati di gestirli.
          </p>
        </div>
      )}
    </div>
  )
}
