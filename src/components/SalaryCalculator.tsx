import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { calculate, PMSS_MENSUEL } from '@/lib/salary-calculator'
import type { Periode, Direction, Statut } from '@/lib/salary-calculator'
import { cn } from '@/lib/utils'

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(v))

const fmtPct = (v: number) =>
  (v * 100).toFixed(2).replace('.', ',') + ' %'

interface PillOption<T> {
  value: T
  label: string
}

interface PillToggleProps<T extends string> {
  options: PillOption<T>[]
  value: T
  onChange: (v: T) => void
}

function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: PillToggleProps<T>) {
  return (
    <div className="flex rounded-lg bg-muted p-1 gap-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
            value === opt.value
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {children}
    </p>
  )
}

export default function SalaryCalculator() {
  const [inputValue, setInputValue] = useState('3000')
  const [periode, setPeriode] = useState<Periode>('mensuel')
  const [direction, setDirection] = useState<Direction>('brut-to-net')
  const [statut, setStatut] = useState<Statut>('non-cadre')
  const [showDetail, setShowDetail] = useState(false)

  const numericValue =
    parseFloat(inputValue.replace(/\s/g, '').replace(',', '.')) || 0

  const result = useMemo(() => {
    if (numericValue <= 0) return null
    return calculate(numericValue, periode, direction, statut)
  }, [numericValue, periode, direction, statut])

  const outputValue =
    result != null
      ? direction === 'brut-to-net'
        ? result.net
        : result.brut
      : null

  const secondary =
    outputValue != null
      ? periode === 'mensuel'
        ? outputValue * 12
        : outputValue / 12
      : null

  const tauxTotal =
    result != null ? result.totalSalarial / result.brut : null

  const inputLabel =
    direction === 'brut-to-net'
      ? `Salaire brut ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`
      : `Salaire net ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`

  const outputLabel =
    direction === 'brut-to-net'
      ? `Salaire net ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`
      : `Salaire brut ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-lg">
        {/* En-tête */}
        <div className="mb-7 text-center">
          <h1 className="text-[1.6rem] font-bold text-slate-900 tracking-tight leading-tight">
            Calculateur salaire brut / net
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Secteur privé · Taux 2025
          </p>
        </div>

        <Card className="shadow-md border border-slate-200 rounded-2xl">
          <CardContent className="p-6 space-y-5">
            {/* Période + Statut */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Période</FieldLabel>
                <PillToggle
                  options={[
                    { value: 'mensuel' as Periode, label: 'Mensuel' },
                    { value: 'annuel' as Periode, label: 'Annuel' },
                  ]}
                  value={periode}
                  onChange={setPeriode}
                />
              </div>
              <div>
                <FieldLabel>Statut</FieldLabel>
                <PillToggle
                  options={[
                    { value: 'non-cadre' as Statut, label: 'Non-cadre' },
                    { value: 'cadre' as Statut, label: 'Cadre' },
                  ]}
                  value={statut}
                  onChange={setStatut}
                />
              </div>
            </div>

            {/* Sens du calcul */}
            <div>
              <FieldLabel>Sens du calcul</FieldLabel>
              <PillToggle
                options={[
                  { value: 'brut-to-net' as Direction, label: 'Brut → Net' },
                  { value: 'net-to-brut' as Direction, label: 'Net → Brut' },
                ]}
                value={direction}
                onChange={setDirection}
              />
            </div>

            {/* Champ de saisie */}
            <div>
              <label
                htmlFor="salary-input"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                {inputLabel}
              </label>
              <div className="relative">
                <Input
                  id="salary-input"
                  type="number"
                  min={0}
                  step={100}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="text-base pr-10 h-11"
                  placeholder="Ex : 3 000"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none select-none">
                  €
                </span>
              </div>
            </div>

            {/* Résultat */}
            {result != null && outputValue != null && (
              <>
                <Separator />

                {/* Résultat principal */}
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-5 text-center">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1.5">
                    {outputLabel}
                  </p>
                  <p className="text-5xl font-bold text-emerald-800 tabular-nums tracking-tight">
                    {fmt(outputValue)}
                  </p>
                  {secondary != null && (
                    <p className="text-sm text-emerald-600 mt-2">
                      soit{' '}
                      <span className="font-semibold">{fmt(secondary)}</span>
                      {' '}par {periode === 'mensuel' ? 'an' : 'mois'}
                    </p>
                  )}
                </div>

                {/* Résumé en 3 colonnes */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                      Brut
                    </p>
                    <p className="text-sm font-semibold text-slate-700 tabular-nums">
                      {fmt(result.brut)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                      Cotisations
                    </p>
                    <p className="text-sm font-semibold text-red-500 tabular-nums">
                      −{fmt(result.totalSalarial)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                      Taux
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {tauxTotal != null ? fmtPct(tauxTotal) : '—'}
                    </p>
                  </div>
                </div>

                {/* Bouton détail */}
                <button
                  type="button"
                  onClick={() => setShowDetail(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors py-0.5 cursor-pointer"
                >
                  <svg
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      showDetail && 'rotate-180',
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {showDetail
                    ? 'Masquer le détail'
                    : 'Voir le détail des cotisations'}
                </button>

                {/* Tableau de détail */}
                {showDetail && (
                  <div className="overflow-hidden rounded-xl border border-slate-200 text-sm">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Cotisation salariale
                          </th>
                          <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                            Base
                          </th>
                          <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Taux
                          </th>
                          <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.lignes.map((line, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="py-2 px-3 text-slate-600">
                              {line.label}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400 tabular-nums hidden sm:table-cell">
                              {fmt(line.base)}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-500 tabular-nums">
                              {fmtPct(line.rate)}
                            </td>
                            <td className="py-2 px-3 text-right font-medium text-red-500 tabular-nums">
                              −{fmt(line.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t border-slate-200">
                          <td className="py-2.5 px-3 text-sm font-semibold text-slate-700">
                            Total cotisations
                          </td>
                          <td className="py-2.5 px-3 hidden sm:table-cell" />
                          <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                            {tauxTotal != null ? fmtPct(tauxTotal) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-red-600 tabular-nums">
                            −{fmt(result.totalSalarial)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Pied de page */}
        <p className="text-center text-xs text-slate-400 mt-4">
          PMSS mensuel 2025 : {fmt(PMSS_MENSUEL)} · Hors conventions collectives · Net avant impôt
        </p>
      </div>
    </div>
  )
}
