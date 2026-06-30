'use client'

import { useState, useEffect } from 'react'

export default function ImpostazioniPage() {
  const [form, setForm] = useState({ email_admin: '', email_magazzino: '' })
  const [caricamento, setCaricamento] = useState(true)
  const [salvato, setSalvato] = useState(false)
  const [errore, setErrore] = useState('')

  const [portali, setPortali] = useState([])
  const [nuovoPortale, setNuovoPortale] = useState('')
  const [errorePortale, setErrorePortale] = useState('')
  const [aggiungendo, setAggiungendo] = useState(false)

  const [corrieri, setCorrieri] = useState([])
  const [nuovoCorriere, setNuovoCorriere] = useState('')
  const [erroreCorriere, setErroreCorriere] = useState('')
  const [aggiungendoCorriere, setAggiungendoCorriere] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/impostazioni').then(r => r.json()),
      fetch('/api/portali').then(r => r.json()),
      fetch('/api/corrieri').then(r => r.json()),
    ]).then(([imp, port, corr]) => {
      setForm(imp)
      setPortali(port)
      setCorrieri(corr)
      setCaricamento(false)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErrore('')
    setSalvato(false)
    const res = await fetch('/api/impostazioni', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setSalvato(true)
      setTimeout(() => setSalvato(false), 3000)
    } else {
      setErrore('Errore nel salvataggio')
    }
  }

  async function aggiungiPortale(e) {
    e.preventDefault()
    if (!nuovoPortale.trim()) return
    setAggiungendo(true)
    setErrorePortale('')
    const res = await fetch('/api/portali', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nuovoPortale.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setPortali(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNuovoPortale('')
    } else {
      setErrorePortale(data.error || 'Errore durante l\'aggiunta')
    }
    setAggiungendo(false)
  }

  async function rimuoviPortale(id) {
    const res = await fetch(`/api/portali/${id}`, { method: 'DELETE' })
    if (res.ok) setPortali(prev => prev.filter(p => p.id !== id))
  }

  async function aggiungiCorriere(e) {
    e.preventDefault()
    if (!nuovoCorriere.trim()) return
    setAggiungendoCorriere(true)
    setErroreCorriere('')
    const res = await fetch('/api/corrieri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nuovoCorriere.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setCorrieri(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNuovoCorriere('')
    } else {
      setErroreCorriere(data.error || 'Errore durante l\'aggiunta')
    }
    setAggiungendoCorriere(false)
  }

  async function rimuoviCorriere(id) {
    const res = await fetch(`/api/corrieri/${id}`, { method: 'DELETE' })
    if (res.ok) setCorrieri(prev => prev.filter(c => c.id !== id))
  }

  if (caricamento) return <div className="text-gray-500 py-8">Caricamento...</div>

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Impostazioni</h1>

      {/* Email */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email notifiche</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              La tua email (riceve aggiornamenti da Ivan)
            </label>
            <input
              type="email"
              value={form.email_admin}
              onChange={e => setForm(p => ({ ...p, email_admin: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Ivan (riceve nuovi ordini)
            </label>
            <input
              type="email"
              value={form.email_magazzino}
              onChange={e => setForm(p => ({ ...p, email_magazzino: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {errore && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">{errore}</div>
        )}
        {salvato && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5">✅ Impostazioni salvate</div>
        )}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
          Salva impostazioni
        </button>
      </form>

      {/* Portali */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Portali di acquisto</h2>

        <div className="space-y-2 mb-4">
          {portali.length === 0 && (
            <p className="text-sm text-gray-400 italic">Nessun portale configurato</p>
          )}
          {portali.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
              <span className="text-sm font-medium text-gray-700">{p.nome}</span>
              <button
                onClick={() => rimuoviPortale(p.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Rimuovi
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={aggiungiPortale} className="flex gap-2">
          <input
            type="text"
            value={nuovoPortale}
            onChange={e => setNuovoPortale(e.target.value)}
            placeholder="Es: Bricofer, eBay…"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={aggiungendo || !nuovoPortale.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {aggiungendo ? '...' : '+ Aggiungi'}
          </button>
        </form>
        {errorePortale && (
          <p className="text-xs text-red-600 mt-2">{errorePortale}</p>
        )}
      </div>

      {/* Corrieri */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Corrieri</h2>

        <div className="space-y-2 mb-4">
          {corrieri.length === 0 && (
            <p className="text-sm text-gray-400 italic">Nessun corriere configurato</p>
          )}
          {corrieri.map(c => (
            <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
              <span className="text-sm font-medium text-gray-700">{c.nome}</span>
              <button
                onClick={() => rimuoviCorriere(c.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Rimuovi
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={aggiungiCorriere} className="flex gap-2">
          <input
            type="text"
            value={nuovoCorriere}
            onChange={e => setNuovoCorriere(e.target.value)}
            placeholder="Es: BRT, DHL, SDA…"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={aggiungendoCorriere || !nuovoCorriere.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {aggiungendoCorriere ? '...' : '+ Aggiungi'}
          </button>
        </form>
        {erroreCorriere && (
          <p className="text-xs text-red-600 mt-2">{erroreCorriere}</p>
        )}
      </div>
    </div>
  )
}
