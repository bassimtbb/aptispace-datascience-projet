import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const FIELDS = [
  { key: 'cylinders',    label: 'Cylindres',      step: 1,   unit: 'cyl',  fmt: v => Math.round(v) },
  { key: 'displacement', label: 'Cylindrée',       step: 5,   unit: 'cm³',  fmt: v => Math.round(v) },
  { key: 'horsepower',   label: 'Puissance',       step: 1,   unit: 'hp',   fmt: v => Math.round(v) },
  { key: 'weight',       label: 'Poids',            step: 50,  unit: 'lbs',  fmt: v => Math.round(v).toLocaleString() },
  { key: 'acceleration', label: 'Accélération',    step: 0.5, unit: 's',    fmt: v => Number(v).toFixed(1) },
  { key: 'model_year',   label: 'Année modèle',    step: 1,   unit: '',     fmt: v => `19${Math.round(v)}` },
]

const ORIGIN_OPTIONS = [
  { value: 0, label: 'Europe' },
  { value: 1, label: 'Japon' },
  { value: 2, label: 'USA' },
]

const FALLBACK_META = {
  cylinders:    { min: 3,    max: 8    },
  displacement: { min: 70,   max: 455  },
  horsepower:   { min: 46,   max: 230  },
  weight:       { min: 1600, max: 5140 },
  acceleration: { min: 8,    max: 25   },
  model_year:   { min: 70,   max: 82   },
}

const CATEGORY_STYLE = {
  faible:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Faible (< 20 MPG)'   },
  moyenne: { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Moyenne (20–30 MPG)' },
  élevée:  { bg: 'bg-emerald-100',text: 'text-emerald-700',label: 'Élevée (> 30 MPG)'   },
}

const IMPORTANCE_COLORS = ['bg-blue-500', 'bg-indigo-400', 'bg-violet-400']

function midpoint(meta, key) {
  const m = meta[key] ?? FALLBACK_META[key]
  return Math.round((m.min + m.max) / 2)
}

export default function PredictorPage() {
  const [meta, setMeta] = useState(FALLBACK_META)
  const [values, setValues] = useState({
    cylinders: 4, displacement: 150, horsepower: 100,
    weight: 2500, acceleration: 15, model_year: 76, origin: 2,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${API}/metadata`)
      .then(res => {
        setMeta(res.data)
        setValues(prev => ({
          ...prev,
          cylinders:    midpoint(res.data, 'cylinders'),
          displacement: midpoint(res.data, 'displacement'),
          horsepower:   midpoint(res.data, 'horsepower'),
          weight:       midpoint(res.data, 'weight'),
          acceleration: midpoint(res.data, 'acceleration'),
          model_year:   midpoint(res.data, 'model_year'),
        }))
      })
      .catch(() => {}) // stay on fallback defaults silently
  }, [])

  const set = key => e => setValues(prev => ({ ...prev, [key]: Number(e.target.value) }))

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const [predRes, explainRes] = await Promise.all([
        axios.post(`${API}/predict`, values),
        axios.post(`${API}/explain`, values),
      ])
      setResult({ ...predRes.data, importances: explainRes.data })
    } catch {
      setError('Le backend est inaccessible. Vérifiez que le conteneur FastAPI tourne sur http://localhost:8000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Prédicteur de consommation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ajustez les paramètres, puis cliquez sur Prédire</p>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* ── Inputs panel ── */}
          <div className="flex-1 rounded-xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Paramètres du véhicule</h2>

            {FIELDS.map(({ key, label, step, unit, fmt }) => {
              const m = meta[key] ?? FALLBACK_META[key]
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <span className="text-sm font-bold text-blue-600">
                      {fmt(values[key])} {unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={m.min} max={m.max} step={step}
                    value={values[key]}
                    onChange={set(key)}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>{fmt(m.min)}</span>
                    <span>{fmt(m.max)}</span>
                  </div>
                </div>
              )
            })}

            {/* Origin select */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Origine</label>
              <select
                value={values.origin}
                onChange={set('origin')}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {ORIGIN_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Calcul en cours…
                </>
              ) : 'Prédire le MPG'}
            </button>
          </div>

          {/* ── Result panel ── */}
          <div className="flex-1 rounded-xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Résultat</h2>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold mb-1">⚠ Erreur de connexion</p>
                <p>{error}</p>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2 py-10">
                <p className="text-sm">La prédiction apparaîtra ici</p>
              </div>
            )}

            {result && (
              <>
                {/* MPG value */}
                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Consommation prédite</p>
                  <p className="text-6xl font-black text-gray-900 leading-none">{result.mpg}</p>
                  <p className="text-sm text-gray-500 mt-1">miles per gallon</p>
                  {(() => {
                    const cat = CATEGORY_STYLE[result.category] ?? {}
                    return (
                      <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.text}`}>
                        {cat.label ?? result.category}
                      </span>
                    )
                  })()}
                </div>

                {/* Feature importances */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Top 3 variables influentes</p>
                  <div className="flex flex-col gap-3">
                    {result.importances.map(({ feature, importance }, i) => (
                      <div key={feature}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{feature}</span>
                          <span className="text-gray-500">{(importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${IMPORTANCE_COLORS[i]}`}
                            style={{ width: `${(importance * 100).toFixed(1)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
