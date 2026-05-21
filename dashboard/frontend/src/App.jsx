import React from 'react'
import { useCarData } from './hooks/useCarData'
import Sidebar from './components/Sidebar'
import KPICards from './components/KPICards'
import MPGLineChart from './components/charts/MPGLineChart'
import ScatterPlot from './components/charts/ScatterPlot'
import OriginBarChart from './components/charts/OriginBarChart'
import CylindersChart from './components/charts/CylindersChart'

export default function App() {
  const { filteredData, filters, setFilters } = useCarData()

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar filters={filters} setFilters={setFilters} />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AptiSpace — Analyse Automobile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredData.length} véhicule{filteredData.length !== 1 ? 's' : ''} sélectionné{filteredData.length !== 1 ? 's' : ''}
            </p>
          </div>
        </header>

        <KPICards data={filteredData} />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MPGLineChart data={filteredData} />
          <ScatterPlot data={filteredData} />
          <OriginBarChart data={filteredData} />
          <CylindersChart data={filteredData} />
        </section>

        {/* Sprint 5 — ML Predictor */}
        <section className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 flex flex-col items-center justify-center text-blue-400 h-32">
          <span className="text-lg font-medium">🤖 Prédicteur de consommation</span>
          <span className="text-xs mt-1">Formulaire + appel API FastAPI — Sprint 5</span>
        </section>
      </main>
    </div>
  )
}
