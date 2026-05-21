import React, { useState, useMemo } from 'react'
import { useCarData } from '../hooks/useCarData'
import Sidebar from '../components/Sidebar'

const ORIGIN_LABEL = { europe: 'Europe', japan: 'Japon', usa: 'USA' }

const COLUMNS = [
  { key: 'originLabel',  label: 'Origine',     fmt: v => ORIGIN_LABEL[v] ?? v },
  { key: 'cylinders',    label: 'Cylindres',    fmt: v => v },
  { key: 'horsepower',   label: 'Puissance (hp)', fmt: v => v },
  { key: 'weight',       label: 'Poids (lbs)',  fmt: v => Number(v).toLocaleString() },
  { key: 'mpg',          label: 'MPG',          fmt: v => Number(v).toFixed(1) },
]

function SortIcon({ dir }) {
  if (!dir) return <span className="ml-1 opacity-20">↕</span>
  return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function DataTablePage() {
  const { filteredData, filters, setFilters } = useCarData()
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState('mpg')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = key => {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const displayData = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = q
      ? filteredData.filter(row =>
          COLUMNS.some(({ key, fmt }) =>
            String(fmt(row[key])).toLowerCase().includes(q)
          )
        )
      : filteredData

    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filteredData, search, sortKey, sortDir])

  return (
    <div className="flex h-full w-full bg-gray-50">
      <Sidebar filters={filters} setFilters={setFilters} />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Données brutes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {displayData.length} / {filteredData.length} véhicule{filteredData.length !== 1 ? 's' : ''}
            </p>
          </div>
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </header>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
                  >
                    {label}
                    <SortIcon dir={sortKey === key ? sortDir : null} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Aucun véhicule ne correspond à la sélection.
                  </td>
                </tr>
              )}
              {displayData.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-50 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                >
                  {COLUMNS.map(({ key, fmt }) => (
                    <td key={key} className="px-4 py-2.5 text-gray-700">
                      {key === 'originLabel'
                        ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                            ${row.originLabel === 'usa'    ? 'bg-blue-100 text-blue-700'   : ''}
                            ${row.originLabel === 'europe' ? 'bg-emerald-100 text-emerald-700' : ''}
                            ${row.originLabel === 'japan'  ? 'bg-amber-100 text-amber-700'  : ''}
                          `}>
                            {ORIGIN_LABEL[row.originLabel] ?? row.originLabel}
                          </span>
                        : fmt(row[key])
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
