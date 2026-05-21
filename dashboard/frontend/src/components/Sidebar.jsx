import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const SELECT = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer'
const LABEL = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1'
const NAV_BASE = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors'

export default function Sidebar({ filters, setFilters }) {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/'
  const set = key => e => setFilters(f => ({ ...f, [key]: e.target.value }))

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 p-5 flex flex-col gap-5 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-gray-800">AptiSpace</h2>
        <p className="text-xs text-gray-400 mt-0.5">Dashboard & IA</p>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${NAV_BASE} ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`
          }
        >
          📊 Tableau de bord
        </NavLink>
        <NavLink
          to="/predict"
          className={({ isActive }) =>
            `${NAV_BASE} ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`
          }
        >
          🤖 Prédicteur IA
        </NavLink>
      </nav>

      {isDashboard && filters && setFilters && (
        <>
          <hr className="border-gray-100" />
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Filtres</h3>

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
          </div>
        </>
      )}
    </aside>
  )
}
