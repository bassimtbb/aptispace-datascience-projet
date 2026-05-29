import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import rawCsv from '../data/automobile.csv?raw'

// After preprocessing: 0=Europe, 1=Japan, 2=USA (alphabetical encoding from raw labels)
const ORIGIN_MAP = { 0: 'europe', 1: 'japan', 2: 'usa' }

function yearBand(year) {
  if (year <= 74) return 'early'
  if (year <= 78) return 'mid'
  return 'late'
}

export function useCarData() {
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({
    origin: 'all',
    cylinders: 'all',
    yearRange: 'all',
  })

  useEffect(() => {
    const { data: rows } = Papa.parse(rawCsv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    })

    const cleaned = rows
      .filter(r =>
        r.mpg != null && typeof r.mpg === 'number' &&
        r.horsepower != null && typeof r.horsepower === 'number' &&
        r.weight != null && typeof r.weight === 'number' && r.weight !== 0
      )
      .map(r => ({
        ...r,
        power_to_weight: r.horsepower / r.weight,
        originLabel: ORIGIN_MAP[r.origin] ?? 'unknown',
        yearBand: yearBand(r.model_year),
      }))

    setData(cleaned)
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filters.origin !== 'all' && row.originLabel !== filters.origin) return false
      if (filters.cylinders !== 'all' && String(row.cylinders) !== filters.cylinders) return false
      if (filters.yearRange !== 'all' && row.yearBand !== filters.yearRange) return false
      return true
    })
  }, [data, filters])

  return { data, filteredData, filters, setFilters }
}
