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

  // Valeurs dérivées de l'affichage (le composant reste display-only)
  const derived = useMemo(() => {
    if (result == null) return null

    const outputValue = direction === 'brut-to-net' ? result.net : result.brut
    const tauxPasEffectif = tauxPasManuel !== null ? tauxPasManuel / 100 : result.tauxPas
    const netBase = periode === 'mensuel' ? result.net : result.net / 12

    return {
      outputValue,
      outputLabel:
        direction === 'brut-to-net'
          ? `Net social ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`
          : `Brut ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`,
      secondary: periode === 'mensuel' ? outputValue * 12 : outputValue / 12,
      secondaryUnit: periode === 'mensuel' ? 'an' : 'mois',
      tauxTotal: result.totalSalarial / result.brut,
      tauxPasEffectif,
      sliderValue: tauxPasManuel !== null ? tauxPasManuel : result.tauxPas * 100,
      netApresPasMensuel: netBase * (1 - tauxPasEffectif),
      netApresPasAnnuel: netBase * 12 * (1 - tauxPasEffectif),
      pasMensuel: netBase * tauxPasEffectif,
    }
  }, [result, direction, periode, tauxPasManuel])

  function handlePartsChange(v: number) {
    setParts(v)
    setTauxPasManuel(null)
  }

  return {
    derived,
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

/** Valeurs d'affichage dérivées, calculées dans le hook (composants display-only). */
export type SalaryDerived = NonNullable<ReturnType<typeof useSalaryForm>['derived']>
