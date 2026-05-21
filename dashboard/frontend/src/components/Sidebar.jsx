import React from 'react'

const SELECT = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer'
const LABEL = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1'

export default function Sidebar({ filters, setFilters }) {
  const set = key => e => setFilters(f => ({ ...f, [key]: e.target.value }))

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 p-5 flex flex-col gap-6 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-gray-800">Filtres</h2>
        <p className="text-xs text-gray-400 mt-0.5">Affinez la sélection</p>
      </div>

      <div>
        <label className={LABEL}>Origine</label>
        <select className={SELECT} value={filters.origin} onChange={set('origin')}>
          <option value="all">Toutes origines</option>
          <option value="usa">USA</option>
          <option value="europe">Europe</option>
          <option value="japan">Japon</option>
        </select>
      </div>

      <div>
        <label className={LABEL}>Cylindres</label>
        <select className={SELECT} value={filters.cylinders} onChange={set('cylinders')}>
          <option value="all">Tous</option>
          <option value="4">4 cylindres</option>
          <option value="6">6 cylindres</option>
          <option value="8">8 cylindres</option>
        </select>
      </div>

      <div>
        <label className={LABEL}>Époque</label>
        <select className={SELECT} value={filters.yearRange} onChange={set('yearRange')}>
          <option value="all">Toutes</option>
          <option value="early">Anciennes (70–74)</option>
          <option value="mid">Milieu (75–78)</option>
          <option value="late">Récentes (79–82)</option>
        </select>
      </div>
    </aside>
  )
}
