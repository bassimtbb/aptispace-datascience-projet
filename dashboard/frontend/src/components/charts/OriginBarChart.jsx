import React, { useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
} from 'recharts'

const ORIGINS = [
  { key: 'usa',    label: 'USA',    color: '#185FA5' },
  { key: 'europe', label: 'Europe', color: '#0F6E56' },
  { key: 'japan',  label: 'Japon',  color: '#BA7517' },
]

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-gray-600">{payload[0].value.toFixed(1)} MPG avg</p>
    </div>
  )
}

export default function OriginBarChart({ data }) {
  const chartData = useMemo(() => {
    const groups = {}
    for (const row of data) {
      const o = row.originLabel
      if (!o) continue
      if (!groups[o]) groups[o] = { sum: 0, count: 0 }
      groups[o].sum += row.mpg
      groups[o].count += 1
    }
    return ORIGINS
      .filter(({ key }) => groups[key]?.count > 0)
      .map(({ key, label, color }) => ({
        origin: label,
        mpg: groups[key].sum / groups[key].count,
        color,
      }))
  }, [data])

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Average MPG by origin</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="origin" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={36}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="mpg" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {chartData.map(({ origin, color }) => (
              <Cell key={origin} fill={color} />
            ))}
            <LabelList
              dataKey="mpg"
              position="top"
              formatter={v => v.toFixed(1)}
              style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
