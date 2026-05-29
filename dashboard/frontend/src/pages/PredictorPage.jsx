import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const FIELDS = [
  {
    key: 'cylinders', label: 'Cylindres', step: 1, unit: 'cyl', fmt: v => Math.round(v),
    tooltip: 'Nombre de pistons dans le moteur. Un V8 est puissant mais très gourmand ; un 4-cylindres est bien plus économe. Dataset : 3 à 8 cylindres.',
  },
  {
    key: 'displacement', label: 'Cylindrée', step: 5, unit: 'cm³', fmt: v => Math.round(v),
    tooltip: "Volume total des cylindres du moteur. Plus c'est grand, plus la consommation augmente. C'est la variable la plus influente du modèle (44 %).",
  },
  {
    key: 'horsepower', label: 'Puissance', step: 1, unit: 'hp', fmt: v => Math.round(v),
    tooltip: 'Puissance du moteur en chevaux (HP). Plus de puissance = plus d\'énergie brûlée à chaque trajet. Très corrélé à la cylindrée.',
  },
  {
    key: 'weight', label: 'Poids', step: 50, unit: 'lbs', fmt: v => Math.round(v).toLocaleString(),
    tooltip: 'Masse du véhicule en livres (lbs). C\'est le facteur le plus directement corrélé au MPG (−0.83). Chaque −500 lbs ≈ +2.8 MPG gagnés.',
  },
  {
    key: 'acceleration', label: 'Accélération', step: 0.5, unit: 's', fmt: v => Number(v).toFixed(1),
    tooltip: 'Temps en secondes pour passer de 0 à 60 mph. Un chiffre élevé = voiture lente = moteur moins sollicité en usage courant.',
  },
  {
    key: 'model_year', label: 'Année modèle', step: 1, unit: '', fmt: v => `19${Math.round(v)}`,
    tooltip: 'Année de fabrication (70 = 1970, 82 = 1982). Les chocs pétroliers de 1973 et 1979 ont forcé l\'industrie à innover : le MPG moyen a progressé de +82 % sur cette période.',
  },
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
  faible:   { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Faible (< 20 MPG)'   },
  moyenne:  { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Moyenne (20–30 MPG)' },
  'élevée': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Élevée (> 30 MPG)'   },
}

const IMPORTANCE_COLORS = ['#378ADD', '#1D9E75', '#D85A30', '#BA7517', '#7F77DD', '#E24B4A', '#059669', '#6366f1']

const SCENE_CSS = `
@keyframes laneScroll {
  from { transform: translateX(-50%) translateY(0); }
  to   { transform: translateX(-50%) translateY(26px); }
}
@keyframes treeScroll {
  from { top: 52px; opacity: 1; }
  to   { top: 160px; opacity: 0; }
}
@keyframes spuff {
  0%   { opacity: 0.7; transform: translateY(0) scale(1); }
  100% { opacity: 0;   transform: translateY(-18px) scale(2.5); }
}
`

function midpoint(meta, key) {
  const m = meta[key] ?? FALLBACK_META[key]
  return Math.round((m.min + m.max) / 2)
}

function mpgColor(mpg) {
  if (mpg < 20) return '#dc2626'
  if (mpg <= 30) return '#d97706'
  return '#16a34a'
}

function sceneConfig(mpg) {
  const kmh    = Math.round(60 + (mpg / 46) * 80)
  const liters = (9.5 - (mpg / 46) * 6).toFixed(1)
  if (mpg < 20) return {
    sky: '#6b7280', ground: '#4b5563',
    laneDur: '1.4s', treeDur: 3.5,
    smokeOpacity: 1, smokeDur: '0.7s',
    carBody: '#dc2626', carRoof: '#b91c1c', kmh, liters,
  }
  if (mpg <= 30) return {
    sky: '#bfdbfe', ground: '#84cc16',
    laneDur: '0.85s', treeDur: 2,
    smokeOpacity: 0.45, smokeDur: '1.3s',
    carBody: '#d97706', carRoof: '#b45309', kmh, liters,
  }
  return {
    sky: '#93c5fd', ground: '#65a30d',
    laneDur: '0.42s', treeDur: 1,
    smokeOpacity: 0.05, smokeDur: '0.9s',
    carBody: '#16a34a', carRoof: '#15803d', kmh, liters,
  }
}

function smartTip(values, mpg) {
  if (mpg >= 30) return {
    bg: '#EAF3DE', border: '#639922', color: '#27500A',
    text: 'Excellent ! Ce véhicule est dans le top 20% du dataset en efficacité.',
  }
  if (values.cylinders >= 6) return {
    bg: '#EAF3DE', border: '#639922', color: '#27500A',
    text: 'Passer à 4 cylindres pourrait gagner ~+3.5 MPG.',
  }
  if (values.displacement > 200) return {
    bg: '#FAEEDA', border: '#EF9F27', color: '#854F0B',
    text: "Réduire la cylindrée de 60 cm³ améliorerait le MPG d'environ +2.1.",
  }
  if (values.weight > 3000) return {
    bg: '#FAEEDA', border: '#EF9F27', color: '#854F0B',
    text: 'Réduire le poids de 500 lbs pourrait ajouter ~+2.8 MPG.',
  }
  return {
    bg: '#FCEBEB', border: '#E24B4A', color: '#791F1F',
    text: "Réduire la puissance et le poids pour améliorer l'efficacité.",
  }
}

// ── InfoTooltip ───────────────────────────────────────────────────────────────
// position:fixed escapes overflow parents.
// The left edge is clamped to the viewport so the tooltip never clips on the
// right (or left). The arrow is shifted independently to always point at the
// button regardless of how much the box was nudged.
const TOOLTIP_W = 210

function InfoTooltip({ text }) {
  const [tip, setTip] = useState(null)
  const btnRef = useRef(null)

  const show = () => {
    if (!btnRef.current) return
    const r   = btnRef.current.getBoundingClientRect()
    const cx  = r.left + r.width / 2
    // desired left: centre tooltip on button; clamp to keep it inside viewport
    const rawLeft  = cx - TOOLTIP_W / 2
    const left     = Math.max(8, Math.min(rawLeft, window.innerWidth - TOOLTIP_W - 8))
    setTip({ left, top: Math.round(r.top), arrowX: Math.round(cx - left) })
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setTip(null)}
        onClick={() => (tip ? setTip(null) : show())}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold hover:bg-blue-100 hover:text-blue-600 transition-colors focus:outline-none shrink-0 cursor-help select-none"
        aria-label="En savoir plus"
      >
        i
      </button>

      {tip && (
        <div
          style={{
            position: 'fixed',
            left: tip.left,
            top: tip.top - 10,
            transform: 'translateY(-100%)',
            zIndex: 9999,
            width: TOOLTIP_W,
            pointerEvents: 'none',
          }}
        >
          <div className="bg-gray-800 text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-xl">
            {text}
          </div>
          {/* Arrow always points at the button */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: tip.arrowX,
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #1f2937',
          }} />
        </div>
      )}
    </>
  )
}

function HighwayScene({ mpg }) {
  const s = sceneConfig(mpg)
  return (
    <div style={{ position:'relative', width:'100%', height:'120px', overflow:'hidden', borderRadius:'8px', background:'#4b5563' }}>
      {/* Sky */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'55px', background:s.sky, transition:'background 0.8s' }} />
      {/* Sun */}
      <div style={{ position:'absolute', top:'8px', right:'24px', width:'28px', height:'28px', borderRadius:'50%', background:'#fbbf24' }} />
      {/* Ground */}
      <div style={{ position:'absolute', top:'55px', left:0, right:0, bottom:0, background:s.ground, transition:'background 0.8s' }} />
      {/* Road */}
      <div style={{ position:'absolute', top:'55px', left:'50%', transform:'translateX(-50%)', width:'70px', height:'95px', background:'#374151' }} />

      {/* Lane marks */}
      {[62, 88, 114, 140].map(top => (
        <div key={top} style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          width:'5px', height:'18px', background:'#f9fafb', borderRadius:'2px', top:`${top}px`,
          animation:`laneScroll ${s.laneDur} linear infinite`,
        }} />
      ))}

      {/* Trees left */}
      {[['12%','0s'], ['22%',`-${s.treeDur/2}s`]].map(([left, delay], i) => (
        <div key={i} style={{
          position:'absolute', left, top:'52px',
          display:'flex', flexDirection:'column', alignItems:'center',
          animation:`treeScroll ${s.treeDur}s linear infinite`, animationDelay:delay,
        }}>
          <div style={{ width:'18px', height:'20px', background:'#16a34a', borderRadius:'50% 50% 30% 30%' }} />
          <div style={{ width:'5px', height:'10px', background:'#92400e', borderRadius:'1px' }} />
        </div>
      ))}

      {/* Trees right */}
      {[['12%','0s'], ['22%',`-${s.treeDur/2}s`]].map(([right, delay], i) => (
        <div key={i} style={{
          position:'absolute', right, top:'52px',
          display:'flex', flexDirection:'column', alignItems:'center',
          animation:`treeScroll ${s.treeDur}s linear infinite`, animationDelay:delay,
        }}>
          <div style={{ width:'18px', height:'20px', background:'#16a34a', borderRadius:'50% 50% 30% 30%' }} />
          <div style={{ width:'5px', height:'10px', background:'#92400e', borderRadius:'1px' }} />
        </div>
      ))}

      {/* Smoke */}
      <div style={{
        position:'absolute', bottom:'38px', left:'50%',
        transform:'translateX(-50%) translateX(-10px)',
        display:'flex', gap:'3px', alignItems:'flex-end',
        opacity:s.smokeOpacity, transition:'opacity 0.6s',
      }}>
        {[['7px','#9ca3af','0s'],['5px','#d1d5db','0.3s'],['3px','#e5e7eb','0.6s']].map(([sz,bg,delay],i) => (
          <div key={i} style={{
            width:sz, height:sz, borderRadius:'50%', background:bg,
            animation:`spuff ${s.smokeDur} ease-out infinite`, animationDelay:delay,
          }} />
        ))}
      </div>

      {/* Top-down car */}
      <svg style={{ position:'absolute', bottom:'30px', left:'50%', transform:'translateX(-50%)' }}
        width="46" height="80" viewBox="0 0 46 80">
        <rect x="6"  y="10" width="34" height="60" rx="8" fill={s.carBody} style={{transition:'fill 0.5s'}} />
        <rect x="10" y="14" width="26" height="28" rx="4" fill={s.carRoof} opacity=".85" style={{transition:'fill 0.5s'}} />
        <circle cx="8"  cy="18" r="5" fill="#1f2937" />
        <circle cx="38" cy="18" r="5" fill="#1f2937" />
        <circle cx="8"  cy="62" r="5" fill="#1f2937" />
        <circle cx="38" cy="62" r="5" fill="#1f2937" />
        <rect x="14" y="4"  width="18" height="8" rx="3" fill="#fde68a" />
        <rect x="14" y="68" width="18" height="6" rx="2" fill="#fca5a5" />
        <line x1="23" y1="14" x2="23" y2="42" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      </svg>

      {/* Overlays */}
      <div style={{ position:'absolute', top:'8px', left:'10px', fontSize:'10px', fontWeight:500, color:'#fff', background:'rgba(0,0,0,0.35)', padding:'2px 7px', borderRadius:'10px' }}>
        {s.kmh} km/h
      </div>
      <div style={{ position:'absolute', top:'8px', right:'10px', fontSize:'10px', color:'#fff', background:'rgba(0,0,0,0.35)', padding:'2px 7px', borderRadius:'10px' }}>
        {s.liters} L/100km
      </div>
    </div>
  )
}

export default function PredictorPage() {
  const [meta, setMeta]     = useState(FALLBACK_META)
  const [values, setValues] = useState({
    cylinders: 4, displacement: 150, horsepower: 100,
    weight: 2500, acceleration: 15, model_year: 76, origin: 2,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)

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
      .catch(() => {})
  }, [])

  // Auto-predict 400 ms after the last slider change
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
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
    }, 400)
    return () => clearTimeout(timer)
  }, [values])

  const set = key => e => setValues(prev => ({ ...prev, [key]: Number(e.target.value) }))

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
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

  const mpg    = result?.mpg ?? null
  const effPct = mpg != null ? Math.round((mpg / 46.6) * 100) : 0
  const delta  = mpg != null ? mpg - 23.5 : 0
  const catPct = result?.category === 'faible' ? 25 : result?.category === 'moyenne' ? 60 : 90
  const tip    = mpg != null ? smartTip(values, mpg) : null

  return (
    <div className="flex h-full w-full bg-gray-50 font-sans">
      <style>{SCENE_CSS}</style>
      <Sidebar />

      {/*
        Layout strategy
        ───────────────
        Mobile  : main scrolls; panels are auto-height and stack vertically.
        Desktop : main is overflow-hidden; row fills remaining space (flex-1
                  min-h-0); each panel stretches to full row height via flex-1.
                  The left panel uses a flex-1 spacer to pin the button to the
                  bottom, eliminating the empty gap below it.
      */}
      <main className="flex-1 min-h-0 p-4 flex flex-col gap-3 overflow-y-auto lg:overflow-hidden">
        <header className="shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Prédicteur de consommation</h1>
          <p className="text-xs text-gray-500 mt-0.5">Ajustez les paramètres — la prédiction se met à jour automatiquement</p>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-1 lg:min-h-0">

          {/* ── Inputs panel ── */}
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-2
                          lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">Paramètres du véhicule</h2>

            {FIELDS.map(({ key, label, step, unit, fmt, tooltip }) => {
              const m = meta[key] ?? FALLBACK_META[key]
              return (
                <div key={key}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <label className="text-xs font-medium text-gray-600">{label}</label>
                      <InfoTooltip text={tooltip} />
                    </div>
                    <span className="text-xs font-bold text-blue-600">{fmt(values[key])} {unit}</span>
                  </div>
                  <input
                    type="range" min={m.min} max={m.max} step={step}
                    value={values[key]} onChange={set(key)}
                    className="w-full accent-blue-500 cursor-pointer h-4"
                  />
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>{fmt(m.min)}</span><span>{fmt(m.max)}</span>
                  </div>
                </div>
              )
            })}

            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-xs font-medium text-gray-600">Origine</label>
                <InfoTooltip text="Pays d'origine du constructeur. Japonaises : 30.5 MPG en moy. · Européennes : 27.9 MPG · Américaines : 20.1 MPG. Impact faible sur la prédiction (0.5 %) car le poids explique la différence." />
              </div>
              <select value={values.origin} onChange={set('origin')}
                className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400">
                {ORIGIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Spacer: on desktop (fixed-height panel) this grows to fill unused
                space and pins the button to the bottom. On mobile (auto-height
                panel) flex-1 resolves to 0 so it has no visual effect. */}
            <div className="flex-1" />

            <button onClick={handlePredict} disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Calcul en cours…
                </>
              ) : '⚡ Prédire le MPG'}
            </button>
          </div>

          {/* ── Result panel ── */}
          <div className="min-h-[360px] rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-3
                          lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div className="flex items-center gap-1 shrink-0">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Résultat</h2>
              <InfoTooltip text="Panneau de résultats. Une fois les paramètres réglés, le modèle Random Forest (R² = 0.91) calcule le MPG prédit et affiche l'animation, les métriques et les variables influentes." />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <p className="font-semibold mb-0.5">⚠ Erreur de connexion</p>
                <p>{error}</p>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2">
                <span className="text-4xl">🚗</span>
                <p className="text-xs">La prédiction apparaîtra ici</p>
              </div>
            )}

            {result && (
              <>
                {/* 1 — Animated highway scene */}
                <div className="relative">
                  <HighwayScene mpg={result.mpg} />
                  {/* Info overlay — bottom-right corner of the scene */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <span className="text-[9px] text-white opacity-60 select-none">scène</span>
                    <InfoTooltip text="Animation dynamique selon le MPG prédit. 🟢 Vert = économe (>30), 🟡 Orange = moyen (20–30), 🔴 Rouge = faible (<20). La vitesse des arbres, la fumée, la couleur de la voiture et les badges km/h / L/100km changent en temps réel." />
                  </div>
                </div>

                {/* 2 — MPG number + badge */}
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Consommation prédite</p>
                    <p className="text-4xl font-black leading-none mt-0.5"
                      style={{ color: mpgColor(result.mpg), transition: 'color 0.4s' }}>
                      {result.mpg} <span className="text-sm font-normal text-gray-400">MPG</span>
                    </p>
                  </div>
                  {(() => {
                    const cat = CATEGORY_STYLE[result.category] ?? {}
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.text}`}>
                        {cat.label ?? result.category}
                      </span>
                    )
                  })()}
                </div>

                {/* 3 — Mini stat cards */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Efficacité */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xs text-gray-500">Efficacité</p>
                      <InfoTooltip text="Pourcentage par rapport au MPG maximum du dataset (46.6 MPG). Ex : 65% = ce véhicule atteint 65% du meilleur MPG connu dans les données d'entraînement." />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{effPct}%</p>
                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${effPct}%`, background:mpgColor(result.mpg) }} />
                    </div>
                  </div>

                  {/* vs Moyenne */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xs text-gray-500">vs Moyenne</p>
                      <InfoTooltip text="Écart par rapport au MPG moyen du dataset (23.5 MPG). Un chiffre positif = ce véhicule est plus économe que la moyenne. Négatif = moins économe." />
                    </div>
                    <p className="text-sm font-semibold"
                      style={{ color: delta >= 0 ? '#27500A' : '#A32D2D' }}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
                    </p>
                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width:`${Math.min(100, Math.max(0, 50 + (delta / 23.5) * 50))}%`,
                          background: delta >= 0 ? '#639922' : '#E24B4A',
                        }} />
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xs text-gray-500">Catégorie</p>
                      <InfoTooltip text="Classification du véhicule basée sur son MPG. Faible : < 20 MPG · Moyenne : 20–30 MPG · Élevée : > 30 MPG. Ces seuils sont issus du dataset Auto MPG." />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{result.category}</p>
                    <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${catPct}%`, background:mpgColor(result.mpg) }} />
                    </div>
                  </div>
                </div>

                {/* 4 — Feature importances */}
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Variables influentes</p>
                    <InfoTooltip text="Part de chaque caractéristique dans la décision du Random Forest. Plus la barre est longue, plus cette variable a pesé dans la prédiction du MPG pour ce véhicule précis." />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {result.importances.map(({ feature, importance }, i) => (
                      <div key={feature} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-24 shrink-0">{feature}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width:`${(importance * 100).toFixed(1)}%`,
                              background: IMPORTANCE_COLORS[i % IMPORTANCE_COLORS.length],
                            }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{(importance * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5 — Smart tip */}
                {tip && (
                  <div className="rounded-lg px-3 py-2.5 text-xs border-l-4 transition-all duration-300"
                    style={{ background:tip.bg, borderLeftColor:tip.border, color:tip.color }}>
                    {tip.text}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
