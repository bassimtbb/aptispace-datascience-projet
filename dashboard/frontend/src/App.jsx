import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import PredictorPage from './pages/PredictorPage'
import DataTablePage from './pages/DataTablePage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-gray-50 font-sans">

        {/* Global title bar */}
        <div className="shrink-0 bg-gray-900 text-white px-6 py-2.5 flex items-center gap-4">
          <div>
            <span className="text-base font-bold tracking-tight">Automobile MPG Dashboard</span>
            <span className="text-xs text-gray-400 ml-3">
              398 vehicles · 1970–1982 · USA, Europe, Japan
            </span>
          </div>
        </div>

        {/* Route content fills remaining height */}
        <div className="flex flex-1 overflow-hidden">
          <Routes>
            <Route path="/"       element={<DashboardPage />} />
            <Route path="/predict" element={<PredictorPage />} />
            <Route path="/data"    element={<DataTablePage />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  )
}
