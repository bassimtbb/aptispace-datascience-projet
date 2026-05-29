import { useState, useEffect, useRef, useMemo } from "react"
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, Dot,
} from "recharts"

// ── events shown as banner below the title ──────────────────────────────────
const EVENTS = {
  73: {
    type: "crisis",
    title: "Crise pétrolière OPEP — Oct. 1973",
    body: "Embargo arabe : le prix du baril quadruple. MPG atteint son minimum historique à 17.4.",
  },
  74: {
    type: "recovery",
    title: "Réaction de l'industrie — 1974",
    body: "Les constructeurs réduisent cylindrée et poids. Le MPG rebondit de +5.4 miles en un an.",
  },
  80: {
    type: "recovery",
    title: "2ᵉ choc pétrolier — 1979‑1980",
    body: "Révolution iranienne. La transition vers les moteurs économiques s'accélère. MPG explose à 33.7.",
  },
}

// ── static data (same shape as what your useMemo produces) ──────────────────
const STATIC_DATA = [
  { year: 70, mpg: 17.7 },
  { year: 71, mpg: 21.1 },
  { year: 72, mpg: 18.7 },
  { year: 73, mpg: 17.4 },
  { year: 74, mpg: 22.8 },
  { year: 75, mpg: 20.3 },
  { year: 76, mpg: 21.6 },
  { year: 77, mpg: 23.4 },
  { year: 78, mpg: 24.0 },
  { year: 79, mpg: 25.1 },
  { year: 80, mpg: 33.7 },
  { year: 81, mpg: 30.4 },
  { year: 82, mpg: 32.0 },
]

// ── custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0].value == null) return null
  const isCrisis = label === 73
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${isCrisis ? "#fca5a5" : "#e5e7eb"}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>Year 19{label}</p>
      <p style={{ margin: "2px 0 0", color: isCrisis ? "#dc2626" : "#059669" }}>
        {payload[0].value.toFixed(1)} MPG
      </p>
      {isCrisis && (
        <p style={{ margin: "4px 0 0", color: "#dc2626", fontSize: 11 }}>
          ⚠ Minimum historique
        </p>
      )}
    </div>
  )
}

// ── custom dot — red for 1973, green otherwise ────────────────────────────────
function CustomDot(props) {
  const { cx, cy, payload, visibleUpTo } = props
  if (payload.year > visibleUpTo || payload.mpg == null) return null
  const isCrisis = payload.year === 73
  const color = isCrisis ? "#dc2626" : "#10b981"
  const r = isCrisis ? 6 : 4
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      stroke="#fff"
      strokeWidth={2}
    />
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function MPGLineChart({ data }) {
  // If real `data` prop is provided, compute averages; else use static fallback
  const fullData = useMemo(() => {
    if (!data?.length) return STATIC_DATA
    const byYear = {}
    for (const row of data) {
      const y = row.model_year
      if (!byYear[y]) byYear[y] = { sum: 0, count: 0 }
      byYear[y].sum += row.mpg
      byYear[y].count += 1
    }
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, { sum, count }]) => ({ year: Number(year), mpg: sum / count }))
  }, [data])

  const [step, setStep] = useState(fullData.length - 1) // start fully shown
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const timerRef = useRef(null)

  const visibleUpTo = fullData[step]?.year ?? 70

  // Build chart data: null for future points so Recharts gaps them
  const chartData = useMemo(
    () => fullData.map((d) => ({ ...d, mpg: d.year <= visibleUpTo ? d.mpg : null })),
    [fullData, visibleUpTo]
  )

  // Animation ticker
  useEffect(() => {
    if (!playing) return
    timerRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= fullData.length - 1) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, 800 / speed)
    return () => clearInterval(timerRef.current)
  }, [playing, speed, fullData.length])

  function handlePlay() {
    if (playing) {
      setPlaying(false)
    } else {
      if (step >= fullData.length - 1) setStep(0)
      setPlaying(true)
    }
  }

  function cycleSpeed() {
    setSpeed((s) => (s === 1 ? 2 : s === 2 ? 3 : 1))
    if (playing) {
      clearInterval(timerRef.current)
    }
  }

  // Stats
  const cur = fullData[step]
  const prev = step > 0 ? fullData[step - 1] : null
  const delta = prev ? cur.mpg - prev.mpg : null
  const totalTrend = cur.mpg - fullData[0].mpg
  const event = EVENTS[cur?.year]

  // Progress pct
  const pct = ((step / (fullData.length - 1)) * 100).toFixed(1)

  return (
    <div
      style={{
        borderRadius: 12,
        background: "#fff",
        border: "1px solid #f3f4f6",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* ── header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>
            MPG evolution by model year
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
            1970 – 1982 · avg miles per gallon
          </p>
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1,
            minWidth: 56,
            textAlign: "right",
          }}
        >
          19{cur?.year}
        </div>
      </div>

      {/* ── event banner ── */}
      <div
        style={{
          minHeight: 52,
          borderRadius: 8,
          padding: event ? "8px 12px" : 0,
          borderLeft: event ? `3px solid ${event.type === "crisis" ? "#dc2626" : "#10b981"}` : "none",
          background: event
            ? event.type === "crisis"
              ? "#fef2f2"
              : "#f0fdf4"
            : "transparent",
          transition: "all 0.3s",
          overflow: "hidden",
        }}
      >
        {event && (
          <>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                color: event.type === "crisis" ? "#b91c1c" : "#15803d",
              }}
            >
              {event.title}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: event.type === "crisis" ? "#dc2626" : "#16a34a" }}>
              {event.body}
            </p>
          </>
        )}
      </div>

      {/* ── chart ── */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          {/* oil crisis shaded zone */}
          <ReferenceArea
            x1={73}
            x2={74}
            fill="#fee2e2"
            fillOpacity={0.5}
          />
          {/* crisis vertical line */}
          <ReferenceLine
            x={73}
            stroke="#dc2626"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: "Choc '73",
              position: "insideTopRight",
              fontSize: 9,
              fill: "#dc2626",
              dy: 6,
            }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="year"
            tickFormatter={(y) => `'${String(y).slice(-2)}`}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[14, 37]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={(v) => v.toFixed(0)}
            width={32}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="mpg"
            stroke="#10b981"
            strokeWidth={2.5}
            connectNulls={false}
            dot={<CustomDot visibleUpTo={visibleUpTo} />}
            activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* ── controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* play/pause */}
        <button
          onClick={handlePlay}
          style={{
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            color: "#374151",
            whiteSpace: "nowrap",
          }}
        >
          {playing ? "⏸ Pause" : step >= fullData.length - 1 ? "↺ Replay" : "▶ Play"}
        </button>

        {/* progress bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const p = (e.clientX - rect.left) / rect.width
            setStep(Math.round(Math.max(0, Math.min(1, p)) * (fullData.length - 1)))
            setPlaying(false)
          }}
          style={{
            flex: 1,
            height: 4,
            background: "#f3f4f6",
            borderRadius: 2,
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div
            style={{
              width: pct + "%",
              height: "100%",
              background: "#10b981",
              borderRadius: 2,
              transition: "width 0.15s",
            }}
          />
        </div>

        {/* speed */}
        <button
          onClick={cycleSpeed}
          style={{
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 12,
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          {speed}x
        </button>
      </div>

      {/* ── live stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          {
            label: "Current MPG",
            value: cur?.mpg.toFixed(1),
            color: "#111827",
          },
          {
            label: "vs previous year",
            value: delta != null ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}` : "—",
            color: delta == null ? "#9ca3af" : delta >= 0 ? "#16a34a" : "#dc2626",
          },
          {
            label: "Total since 1970",
            value: `${totalTrend >= 0 ? "+" : ""}${totalTrend.toFixed(1)}`,
            color: totalTrend >= 0 ? "#16a34a" : "#dc2626",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>{label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 600, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}