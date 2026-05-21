import React from 'react'
import { useCarData } from '../hooks/useCarData'
import Sidebar from '../components/Sidebar'
import KPICards from '../components/KPICards'
import MPGLineChart from '../components/charts/MPGLineChart'
import ScatterPlot from '../components/charts/ScatterPlot'
import OriginBarChart from '../components/charts/OriginBarChart'
import CylindersChart from '../components/charts/CylindersChart'

export default function DashboardPage() {
  const { filteredData, filters, setFilters } = useCarData()

  return (
    <div className="flex h-full w-full bg-gray-50 font-sans">
      <Sidebar filters={filters} setFilters={setFilters} />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">AptiSpace — Analyse Automobile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredData.length} véhicule{filteredData.length !== 1 ? 's' : ''} sélectionné{filteredData.length !== 1 ? 's' : ''}
          </p>
        </header>

        <KPICards data={filteredData} />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MPGLineChart data={filteredData} />
          <ScatterPlot data={filteredData} />
          <OriginBarChart data={filteredData} />
          <CylindersChart data={filteredData} />
        </section>
      </main>
    </div>
  )
}
