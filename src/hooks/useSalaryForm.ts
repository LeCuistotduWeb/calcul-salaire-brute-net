import { useState, useMemo } from 'react'
import { calculate } from '@/lib/salary-calculator'
import type { Periode, Direction, Statut } from '@/lib/salary-calculator'

export function useSalaryForm() {
  const [inputValue, setInputValue] = useState('3000')
  const [periode, setPeriode] = useState<Periode>('mensuel')
  const [direction, setDirection] = useState<Direction>('brut-to-net')
  const [statut, setStatut] = useState<Statut>('non-cadre')
  const [parts, setParts] = useState(1)
  const [showDetail, setShowDetail] = useState(false)
  const [tauxPasManuel, setTauxPasManuel] = useState<number | null>(null)

  const numericValue = useMemo(
    () => parseFloat(inputValue.replace(/\s/g, '').replace(',', '.')) || 0,
    [inputValue],
  )

  const result = useMemo(() => {
    if (numericValue <= 0) return null
    return calculate(numericValue, periode, direction, statut, parts)
  }, [numericValue, periode, direction, statut, parts])

  const inputLabel =
    direction === 'brut-to-net'
      ? `Salaire brut ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`
      : `Salaire net ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`

  function handlePartsChange(v: number) {
    setParts(v)
    setTauxPasManuel(null)
  }

  return {
    inputValue,
    setInputValue,
    periode,
    setPeriode,
    direction,
    setDirection,
    statut,
    setStatut,
    parts,
    handlePartsChange,
    showDetail,
    toggleDetail: () => setShowDetail((v) => !v),
    tauxPasManuel,
    handleTauxPasChange: (pct: number) => setTauxPasManuel(pct),
    resetTauxPas: () => setTauxPasManuel(null),
    result,
    inputLabel,
  }
}
