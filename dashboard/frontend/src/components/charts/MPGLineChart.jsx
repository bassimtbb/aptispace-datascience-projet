import React, { useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Dot,
} from 'recharts'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-gray-700">Year 19{label}</p>
      <p className="text-emerald-600">{payload[0].value.toFixed(1)} MPG</p>
    </div>
  )
}

export default function MPGLineChart({ data }) {
  const chartData = useMemo(() => {
    const byYear = {}
    for (const row of data) {
      const y = row.model_year
      if (!byYear[y]) byYear[y] = { sum: 0, count: 0 }
      byYear[y].sum += row.mpg
      byYear[y].count += 1
    }
    return Object.entries(byYear)
      .sort(([a], [b]) => a - b)
      .map(([year, { sum, count }]) => ({
        year: Number(year),
        mpg: sum / count,
      }))
  }, [data])

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">MPG evolution by model year</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tickFormatter={y => `'${String(y).slice(-2)}`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={v => v.toFixed(0)}
            width={36}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="mpg"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={<Dot r={4} fill="#10b981" stroke="#fff" strokeWidth={2} />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
