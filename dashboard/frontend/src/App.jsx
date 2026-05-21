import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import PredictorPage from './pages/PredictorPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/predict" element={<PredictorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
