'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TIPI_PRODOTTO = ['Box doccia', 'Walk-in', 'Piatto doccia', 'Altro']

function prodottiToMateriale(prodotti) {
  return prodotti
    .filter(p => p.descrizione.trim())
    .map(p => `${p.quantita}x ${p.tipo} — ${p.descrizione.trim()}`)
    .join('\n')
}

export default function NuovoOrdinePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome_cliente: '',
    cognome_cliente: '',
    telefono_cliente: '',
    portale: '',
    corriere: '',
    note: '',
  })
  const [prodotti, setProdotti] = useState([
    { id: 1, quantita: 1, tipo: 'Box doccia', descrizione: '' }
  ])
  const [portali, setPortali] = useState([])
  const [corrieri, setCorrieri] = useState([])
  const [fileBolla, setFileBolla] = useState(null)
  const [fileDistinta, setFileDistinta] = useState(null)
  const [fileDettagli, setFileDettagli] = useState(null)
  const [caricamento, setCaricamento] = useState(false)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/portali').then(r => r.json()),
      fetch('/api/corrieri').then(r => r.json()),
    ]).then(([port, corr]) => {
      setPortali(port)
      setCorrieri(corr)
    }).catch(() => {})
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function aggiornaProdotto(id, campo, valore) {
    setProdotti(prev => prev.map(p => p.id === id ? { ...p, [campo]: valore } : p))
  }

  function aggiungiProdotto() {
    setProdotti(prev => [...prev, { id: Date.now(), quantita: 1, tipo: 'Box doccia', descrizione: '' }])
  }

  function rimuoviProdotto(id) {
    setProdotti(prev => prev.filter(p => p.id !== id))
  }

  async function uploadPDF(file, tipo) {
    if (!file) return null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('tipo', tipo)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.url
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrore('')

    const materiale = prodottiToMateriale(prodotti)
    if (!materiale) {
      setErrore('Aggiungi almeno un prodotto con descrizione')
      return
    }

    setCaricamento(true)

    try {
      const [bollaUrl, distinataUrl, dettagliUrl] = await Promise.all([
        uploadPDF(fileBolla, 'bolla'),
        uploadPDF(fileDistinta, 'distinta'),
        uploadPDF(fileDettagli, 'dettagli'),
      ])

      const res = await fetch('/api/ordini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          materiale,
          bolla_url: bollaUrl,
          distinta_url: distinataUrl,
          dettagli_url: dettagliUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/admin')
    } catch (err) {
      setErrore(err.message || 'Errore durante il salvataggio')
      setCaricamento(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nuovo Ordine</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">

        {/* Cliente */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dati cliente</h2>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                name="nome_cliente"
                value={form.nome_cliente}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
              <input
                type="text"
                name="cognome_cliente"
                value={form.cognome_cliente}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rossi"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input
                type="tel"
                name="telefono_cliente"
                value={form.telefono_cliente}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+39 333 1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portale di acquisto</label>
              <select
                name="portale"
                value={form.portale}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Seleziona portale —</option>
                {portali.map(p => (
                  <option key={p.id} value={p.nome}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Corriere</label>
              <select
                name="corriere"
                value={form.corriere}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Seleziona corriere —</option>
                {corrieri.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prodotti */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Prodotti *</h2>
          <div className="space-y-3">
            {prodotti.map((p, i) => (
              <div key={p.id} className="flex gap-2 items-start">
                <div className="flex flex-col items-center">
                  <label className="text-xs text-gray-500 mb-1">Qtà</label>
                  <input
                    type="number"
                    min="1"
                    value={p.quantita}
                    onChange={e => aggiornaProdotto(p.id, 'quantita', parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Tipo</label>
                  <select
                    value={p.tipo}
                    onChange={e => aggiornaProdotto(p.id, 'tipo', e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {TIPI_PRODOTTO.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Descrizione (misure, colore, ecc.)</label>
                  <input
                    type="text"
                    value={p.descrizione}
                    onChange={e => aggiornaProdotto(p.id, 'descrizione', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. 80x120 vetro trasparente 6mm"
                  />
                </div>
                {prodotti.length > 1 && (
                  <button
                    type="button"
                    onClick={() => rimuoviProdotto(p.id)}
                    className="mt-5 text-red-400 hover:text-red-600 text-lg leading-none"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={aggiungiProdotto}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Aggiungi prodotto
          </button>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note aggiuntive</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Istruzioni particolari, riferimenti ordine Adeo, ecc."
          />
        </div>

        {/* Documenti */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Documenti PDF (opzionali)</h2>
          <div className="grid grid-cols-3 gap-3">
            <FilePicker label="Bolla di spedizione" onChange={setFileBolla} file={fileBolla} />
            <FilePicker label="Distinta" onChange={setFileDistinta} file={fileDistinta} />
            <FilePicker label="Dettagli ordine" onChange={setFileDettagli} file={fileDettagli} />
          </div>
        </div>

        {errore && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
            {errore}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={caricamento}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {caricamento ? 'Salvataggio in corso...' : '✅ Crea ordine e avvisa Ivan'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  )
}

function FilePicker({ label, onChange, file }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        file
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}>
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => onChange(e.target.files[0] || null)}
        />
        {file ? (
          <div className="text-center px-2">
            <p className="text-green-600 text-xl">✅</p>
            <p className="text-green-700 text-xs font-medium truncate max-w-full">{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 text-2xl">📎</p>
            <p className="text-gray-500 text-xs mt-1">Clicca per PDF</p>
          </div>
        )}
      </label>
    </div>
  )
}
