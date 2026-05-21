import React from 'react'

function avg(arr, key) {
  if (!arr.length) return 0
  return arr.reduce((s, r) => s + (r[key] ?? 0), 0) / arr.length
}

function Card({ label, value, unit, colorClass }) {
  return (
    <div className={`rounded-xl p-5 text-white ${colorClass} flex flex-col gap-1 shadow-md`}>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</span>
      <span className="text-3xl font-bold leading-none">{value}</span>
      <span className="text-xs opacity-70">{unit}</span>
    </div>
  )
}

export default function KPICards({ data }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        label="Véhicules"
        value={data.length}
        unit="dans la sélection"
        colorClass="bg-blue-500"
      />
      <Card
        label="MPG moyen"
        value={avg(data, 'mpg').toFixed(1)}
        unit="miles par gallon"
        colorClass="bg-emerald-500"
      />
      <Card
        label="Puissance moy."
        value={avg(data, 'horsepower').toFixed(0)}
        unit="chevaux"
        colorClass="bg-orange-500"
      />
      <Card
        label="Poids moyen"
        value={Math.round(avg(data, 'weight')).toLocaleString()}
        unit="livres"
        colorClass="bg-purple-500"
      />
    </div>
  )
}
