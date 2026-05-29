import React, { useMemo } from 'react'
import {
  ResponsiveContainer, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ZAxis,
} from 'recharts'

const ORIGIN_COLORS = { usa: '#185FA5', europe: '#0F6E56', japan: '#BA7517' }
const ORIGIN_LABELS = { usa: 'USA', europe: 'Europe', japan: 'Japon' }

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-gray-700 truncate max-w-[180px]">{d.car_name ?? '—'}</p>
      <p className="text-gray-500 text-xs mt-0.5">
        <span className="font-medium text-gray-700">{d.horsepower} hp</span>
        {' · '}
        <span className="font-medium text-gray-700">{Number(d.mpg).toFixed(1)} MPG</span>
      </p>
      <p className="text-xs text-gray-400 capitalize mt-0.5">{ORIGIN_LABELS[d.originLabel] ?? d.originLabel}</p>
    </div>
  )
}

export default function ScatterPlot({ data }) {
  const series = useMemo(() => {
    const groups = { usa: [], europe: [], japan: [] }
    for (const row of data) {
      if (row.originLabel && groups[row.originLabel]) {
        groups[row.originLabel].push({ ...row, mpg: Number(row.mpg), horsepower: Number(row.horsepower) })
      }
    }
    return groups
  }, [data])

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3 h-full">
      <div className="shrink-0">
        <h3 className="text-sm font-semibold text-gray-700">Horsepower vs MPG by origin</h3>
        <p className="text-xs text-gray-400">puissance moteur · efficacité carburant</p>
      </div>
      <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="horsepower"
            name="Horsepower"
            type="number"
            domain={[40, 240]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            label={{ value: 'Puissance (hp)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#9ca3af' }}
          />
          <YAxis
            dataKey="mpg"
            name="MPG"
            type="number"
            domain={[8, 48]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={36}
            label={{ value: 'MPG', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
          />
          <ZAxis range={[28, 28]} />
          <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={v => <span className="text-xs text-gray-600">{ORIGIN_LABELS[v] ?? v}</span>}
          />
          {Object.entries(series).map(([origin, points]) => (
            <Scatter
              key={origin}
              name={origin}
              data={points}
              fill={ORIGIN_COLORS[origin]}
              fillOpacity={0.8}
              stroke={ORIGIN_COLORS[origin]}
              strokeWidth={0.5}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
