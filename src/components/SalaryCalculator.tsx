import { useState, useMemo } from 'react'
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
  (v * 100).toFixed(2).replace('.', ',') + ' %'

interface PillOption<T> {
  value: T
  label: string
}

function PillToggle<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: PillOption<T>[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1 gap-0.5">
      {options.map(opt => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap',
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-500 hover:text-slate-700',
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
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
      {children}
    </p>
  )
}

const PARTS_OPTIONS: PillOption<number>[] = [
  { value: 1, label: '1' },
  { value: 1.5, label: '1,5' },
  { value: 2, label: '2' },
  { value: 2.5, label: '2,5' },
  { value: 3, label: '3' },
]

export default function SalaryCalculator() {
  const [inputValue, setInputValue] = useState('3000')
  const [periode, setPeriode] = useState<Periode>('mensuel')
  const [direction, setDirection] = useState<Direction>('brut-to-net')
  const [statut, setStatut] = useState<Statut>('non-cadre')
  const [parts, setParts] = useState<number>(1)
  const [showDetail, setShowDetail] = useState(false)
  const [tauxPasManuel, setTauxPasManuel] = useState<number | null>(null)

  const numericValue =
    parseFloat(inputValue.replace(/\s/g, '').replace(',', '.')) || 0

  const result = useMemo(() => {
    if (numericValue <= 0) return null
    return calculate(numericValue, periode, direction, statut, parts)
  }, [numericValue, periode, direction, statut, parts])

  const tauxPasEffectif =
    tauxPasManuel !== null ? tauxPasManuel / 100 : (result?.tauxPas ?? 0)

  const outputValue =
    result != null
      ? direction === 'brut-to-net' ? result.net : result.brut
      : null

  const secondary =
    outputValue != null
      ? periode === 'mensuel' ? outputValue * 12 : outputValue / 12
      : null

  const tauxTotal =
    result != null ? result.totalSalarial / result.brut : null

  const inputLabel =
    direction === 'brut-to-net'
      ? `Salaire brut ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`
      : `Salaire net ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`

  const outputLabel =
    direction === 'brut-to-net'
      ? `Net social ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`
      : `Brut ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`

  const netBase =
    result ? (periode === 'mensuel' ? result.net : result.net / 12) : null

  const netApresPasMensuel = netBase != null ? netBase * (1 - tauxPasEffectif) : null
  const netApresPasAnnuel  = netBase != null ? netBase * 12 * (1 - tauxPasEffectif) : null
  const pasMensuel         = netBase != null ? netBase * tauxPasEffectif : null

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-8 relative overflow-hidden">
      {/* Décors de fond */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-5%,rgba(186,230,253,0.5),transparent)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-3xl" />

      <div className="w-full max-w-5xl relative z-10 flex flex-col gap-6">

        {/* ── En-tête ── */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
            Barème 2025 à jour
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
            Simulateur{' '}
            <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
              brut&nbsp;/&nbsp;net
            </span>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1.5 tracking-wide">
            Cotisations sociales · Prélèvement à la source · Secteur privé
          </p>
        </header>

        {/* ── Grille 2 colonnes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">

          {/* ── Colonne gauche : Paramètres ── */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/[0.05] p-6 space-y-4">
            <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
              Paramètres
            </p>

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

            <div>
              <label
                htmlFor="salary-input"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
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
                  className="text-xl font-bold pr-10 h-13 rounded-xl border-slate-200 focus-visible:ring-sky-400/30 focus-visible:border-sky-400"
                  placeholder="3 000"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold pointer-events-none select-none text-lg">
                  €
                </span>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Parts fiscales dans les paramètres */}
            <div>
              <FieldLabel>Parts fiscales (pour le PAS)</FieldLabel>
              <PillToggle
                options={PARTS_OPTIONS}
                value={parts}
                onChange={v => {
                  setParts(v)
                  setTauxPasManuel(null)
                }}
              />
            </div>

            {/* Note de bas de panneau */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3 text-xs text-slate-400 leading-relaxed">
              PMSS mensuel 2025 : <span className="font-semibold text-slate-500">{fmt(PMSS_MENSUEL)}</span>
              {' '}· Hors conventions collectives · Barème IR 2025
            </div>
          </div>

          {/* ── Colonne droite : Résultats ── */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/[0.05] overflow-hidden">

            {result == null || outputValue == null ? (
              /* Placeholder quand pas de résultat */
              <div className="flex flex-col items-center justify-center h-full min-h-[340px] gap-3 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
                  <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">
                  Saisissez un salaire à gauche<br/>pour voir vos résultats
                </p>
              </div>
            ) : (
              <div className="p-5 space-y-4">

                {/* Box net social – emerald */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-5 text-center shadow-lg shadow-emerald-200/60">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent)]" />
                  <p className="relative text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-1.5">
                    {outputLabel}
                  </p>
                  <p className="relative text-5xl font-black text-white tabular-nums tracking-tight">
                    {fmt(outputValue)}
                  </p>
                  {secondary != null && (
                    <p className="relative text-sm text-emerald-100 mt-1.5">
                      soit{' '}
                      <span className="font-bold text-white">{fmt(secondary)}</span>
                      {' '}par {periode === 'mensuel' ? 'an' : 'mois'}
                    </p>
                  )}
                </div>

                {/* Stats : brut / cotisations / taux */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">Brut</p>
                    <p className="text-sm font-bold text-slate-800 tabular-nums">{fmt(result.brut)}</p>
                  </div>
                  <div className="rounded-xl border border-red-100 bg-red-50/70 p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">Cotisations</p>
                    <p className="text-sm font-bold text-red-500 tabular-nums">−{fmt(result.totalSalarial)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">Taux</p>
                    <p className="text-sm font-bold text-slate-700">{tauxTotal != null ? fmtPct(tauxTotal) : '—'}</p>
                  </div>
                </div>

                {/* Toggle détail cotisations */}
                <button
                  type="button"
                  onClick={() => setShowDetail(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors py-0.5 cursor-pointer"
                >
                  <svg
                    className={cn('w-3.5 h-3.5 transition-transform duration-200', showDetail && 'rotate-180')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {showDetail ? 'Masquer le détail' : 'Voir le détail des cotisations'}
                </button>

                {showDetail && (
                  <div className="overflow-hidden rounded-xl border border-slate-200/80 text-sm">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left py-2 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Cotisation salariale</th>
                          <th className="text-right py-2 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Base</th>
                          <th className="text-right py-2 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Taux</th>
                          <th className="text-right py-2 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.lignes.map((line, i) => (
                          <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-1.5 px-3 text-slate-600">{line.label}</td>
                            <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums hidden sm:table-cell">{fmt(line.base)}</td>
                            <td className="py-1.5 px-3 text-right text-slate-500 tabular-nums">{fmtPct(line.rate)}</td>
                            <td className="py-1.5 px-3 text-right font-semibold text-red-500 tabular-nums">−{fmt(line.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t border-slate-200">
                          <td className="py-2 px-3 text-sm font-bold text-slate-700">Total cotisations</td>
                          <td className="py-2 px-3 hidden sm:table-cell" />
                          <td className="py-2 px-3 text-right text-slate-500 tabular-nums">{tauxTotal != null ? fmtPct(tauxTotal) : '—'}</td>
                          <td className="py-2 px-3 text-right font-bold text-red-600 tabular-nums">−{fmt(result.totalSalarial)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                <Separator className="bg-slate-100" />

                {/* Section PAS */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      Prélèvement à la source
                    </p>
                    {result.tauxPas > 0 && tauxPasManuel === null && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 rounded-full px-2.5 py-0.5">
                        <span className="w-1 h-1 rounded-full bg-sky-400" />
                        Estimé · {fmtPct(result.tauxPas)}
                      </span>
                    )}
                  </div>

                  {/* Slider taux PAS */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <FieldLabel>Taux PAS</FieldLabel>
                      <div className="flex items-center gap-2">
                        {tauxPasManuel !== null && (
                          <button
                            type="button"
                            onClick={() => setTauxPasManuel(null)}
                            className="text-[10px] font-semibold text-sky-500 hover:text-sky-700 transition-colors cursor-pointer"
                          >
                            Réinitialiser
                          </button>
                        )}
                        <span className="text-sm font-bold text-slate-800 tabular-nums min-w-[52px] text-right">
                          {fmtPct(tauxPasEffectif)}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      step={0.1}
                      value={tauxPasManuel !== null ? tauxPasManuel : result.tauxPas * 100}
                      onChange={e => setTauxPasManuel(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-sky-500 bg-slate-200"
                    />
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      Ajustez selon votre avis d'impôt · 0 % – 45 %
                    </p>
                  </div>

                  {/* Box net après PAS – sky/indigo */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 px-5 py-4 shadow-lg shadow-sky-200/50">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.14),transparent)]" />
                    <p className="relative text-[10px] font-bold text-sky-100 uppercase tracking-widest mb-3 text-center">
                      Net après impôt
                    </p>
                    <div className="relative grid grid-cols-2 gap-0">
                      <div className="text-center pr-4">
                        <p className="text-[10px] text-sky-200 uppercase tracking-wide font-bold mb-0.5">Mensuel</p>
                        <p className="text-2xl font-black text-white tabular-nums leading-tight">
                          {netApresPasMensuel != null ? fmt(netApresPasMensuel) : '—'}
                        </p>
                        {pasMensuel != null && pasMensuel > 0 && (
                          <p className="text-[11px] text-sky-200 mt-0.5">dont −{fmt(pasMensuel)} PAS</p>
                        )}
                      </div>
                      <div className="text-center border-l border-white/20 pl-4">
                        <p className="text-[10px] text-sky-200 uppercase tracking-wide font-bold mb-0.5">Annuel</p>
                        <p className="text-2xl font-black text-white tabular-nums leading-tight">
                          {netApresPasAnnuel != null ? fmt(netApresPasAnnuel) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
