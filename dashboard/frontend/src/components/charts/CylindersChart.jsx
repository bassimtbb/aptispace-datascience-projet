import React, { useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts'

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-semibold text-gray-700">{label} cylinders</p>
      <p className="text-blue-600">{payload[0].value} cars</p>
    </div>
  )
}

export default function CylindersChart({ data }) {
  const chartData = useMemo(() => {
    const counts = {}
    for (const row of data) {
      const c = row.cylinders
      counts[c] = (counts[c] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([cyl, count]) => ({ cylinders: `${cyl} cyl`, count }))
  }, [data])

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Cars by cylinder count</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="cylinders" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={36} />
          <Tooltip content={<BarTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={64}>
            <LabelList
              dataKey="count"
              position="top"
              style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
