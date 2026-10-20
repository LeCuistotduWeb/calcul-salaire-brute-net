import { useState, useMemo, useEffect } from 'react'
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

/* ── Dark mode ── */
function useDarkMode() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return { dark, toggle: () => setDark(v => !v) }
}

/* ── PillToggle — fieldset/legend pour la sémantique de groupe ── */
interface PillOption<T> { value: T; label: string }

function PillToggle<T extends string | number>({
  legend, options, value, onChange,
}: { legend: string; options: PillOption<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="border-0 p-0 m-0 min-w-0">
      <legend className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{legend}</legend>
      <div role="radiogroup" className="flex rounded-xl bg-muted p-1 gap-0.5">
        {options.map(opt => (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap',
              value === opt.value
                ? 'bg-[var(--bg-surface-strong)] text-[var(--text-base)] shadow-sm'
                : 'text-[var(--text-soft)] hover:text-[var(--text-base)]',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/* ── Kicker pour les titres de section (non-formulaire) ── */
function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="island-kicker mb-1.5">{children}</p>
}

const PARTS_OPTIONS: PillOption<number>[] = [
  { value: 1, label: '1' },
  { value: 1.5, label: '1,5' },
  { value: 2, label: '2' },
  { value: 2.5, label: '2,5' },
  { value: 3, label: '3' },
]

export default function SalaryCalculator() {
  const { dark, toggle: toggleDark } = useDarkMode()

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
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl flex flex-col gap-7">

        {/* ── En-tête ── */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="island-kicker mb-2">Outil · Barème 2025</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-black tracking-tight leading-tight text-[var(--text-base)]">
              Simulateur salaire{' '}
              <span className="text-[var(--brand)]">brut&nbsp;/&nbsp;net</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Cotisations sociales · Prélèvement à la source · Secteur privé
            </p>
          </div>

          {/* Toggle dark/light */}
          <button
            type="button"
            onClick={toggleDark}
            aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="mt-1 flex-shrink-0 w-9 h-9 rounded-xl island-shell flex items-center justify-center cursor-pointer text-[var(--text-soft)] hover:text-[var(--text-base)] transition-colors"
          >
            {dark ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </header>

        {/* ── Grille 2 colonnes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">

          {/* ── Paramètres ── */}
          <div className="island-shell rounded-2xl p-6 space-y-5">
            <p className="island-kicker">Paramètres</p>

            <div className="grid grid-cols-2 gap-3">
              <PillToggle
                legend="Période"
                options={[
                  { value: 'mensuel' as Periode, label: 'Mensuel' },
                  { value: 'annuel' as Periode, label: 'Annuel' },
                ]}
                value={periode}
                onChange={setPeriode}
              />
              <PillToggle
                legend="Statut"
                options={[
                  { value: 'non-cadre' as Statut, label: 'Non-cadre' },
                  { value: 'cadre' as Statut, label: 'Cadre' },
                ]}
                value={statut}
                onChange={setStatut}
              />
            </div>

            <PillToggle
              legend="Sens du calcul"
              options={[
                { value: 'brut-to-net' as Direction, label: 'Brut → Net' },
                { value: 'net-to-brut' as Direction, label: 'Net → Brut' },
              ]}
              value={direction}
              onChange={setDirection}
            />

            <div>
              <label
                htmlFor="salary-input"
                className="block text-sm font-semibold text-[var(--text-base)] mb-1.5"
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
                  className="text-xl font-bold pr-10 h-12 rounded-xl bg-[var(--bg-surface-strong)] border-[var(--line)] focus-visible:ring-[var(--brand)]/30 focus-visible:border-[var(--brand)]"
                  placeholder="3 000"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-ghost)] font-semibold pointer-events-none select-none text-lg">
                  €
                </span>
              </div>
            </div>

            <Separator className="bg-[var(--line)]" />

            <PillToggle
              legend="Parts fiscales (PAS)"
              options={PARTS_OPTIONS}
              value={parts}
              onChange={v => { setParts(v); setTauxPasManuel(null) }}
            />

            <div className="rounded-xl bg-[var(--bg-inner)] border border-[var(--line)] px-3.5 py-3 text-xs text-[var(--text-soft)] leading-relaxed">
              PMSS mensuel 2025 : <span className="font-bold text-[var(--text-base)]">{fmt(PMSS_MENSUEL)}</span>
              {' '}· Hors conventions collectives · Barème IR 2025
            </div>
          </div>

          {/* ── Résultats ── */}
          <div className="island-shell rounded-2xl overflow-hidden">
            {result == null || outputValue == null ? (
              <div className="flex flex-col items-center justify-center min-h-[340px] gap-3 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-inner)] border border-[var(--line)] flex items-center justify-center mb-1">
                  <svg className="w-6 h-6 text-[var(--text-ghost)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-sm text-[var(--text-soft)] font-medium">
                  Saisissez un salaire à gauche<br />pour voir vos résultats
                </p>
              </div>
            ) : (
              <div className="p-5 space-y-4">

                {/* ── Box net social — navy ── */}
                <div className="relative overflow-hidden rounded-xl px-6 py-5 text-center"
                  style={{ background: 'linear-gradient(135deg, #253c59, #1a2d45)' }}
                >
                  <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.12), transparent)' }} />
                  <p className="island-kicker relative" style={{ color: 'rgba(193,210,228,0.7)' }}>
                    {outputLabel}
                  </p>
                  <p className="relative text-5xl font-black text-white tabular-nums tracking-tight mt-1">
                    {fmt(outputValue)}
                  </p>
                  {secondary != null && (
                    <p className="relative text-sm mt-2" style={{ color: 'rgba(193,210,228,0.8)' }}>
                      soit{' '}
                      <span className="font-bold text-white">{fmt(secondary)}</span>
                      {' '}par {periode === 'mensuel' ? 'an' : 'mois'}
                    </p>
                  )}
                </div>

                {/* ── Stats : brut / cotisations / taux ── */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Brut', value: fmt(result.brut), className: 'text-[var(--text-base)]' },
                    { label: 'Cotisations', value: `−${fmt(result.totalSalarial)}`, className: 'text-[var(--brand)]' },
                    { label: 'Taux', value: tauxTotal != null ? fmtPct(tauxTotal) : '—', className: 'text-[var(--text-base)]' },
                  ].map(({ label, value, className }) => (
                    <div key={label} className="rounded-xl border border-[var(--line)] bg-[var(--bg-inner)] p-3 text-center">
                      <p className="island-kicker mb-1">{label}</p>
                      <p className={cn('text-sm font-bold tabular-nums', className)}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* ── Toggle détail ── */}
                <button
                  type="button"
                  onClick={() => setShowDetail(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-[var(--text-soft)] hover:text-[var(--text-base)] transition-colors py-0.5 cursor-pointer"
                >
                  <svg
                    className={cn('w-3.5 h-3.5 transition-transform duration-200', showDetail && 'rotate-180')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {showDetail ? 'Masquer le détail' : 'Voir le détail des cotisations'}
                </button>

                {/* ── Tableau détail ── */}
                {showDetail && (
                  <div className="overflow-hidden rounded-xl border border-[var(--line)] text-sm">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--line)] bg-[var(--bg-inner)]">
                          <th className="text-left py-2 px-3 island-kicker">Cotisation salariale</th>
                          <th className="text-right py-2 px-3 island-kicker hidden sm:table-cell">Base</th>
                          <th className="text-right py-2 px-3 island-kicker">Taux</th>
                          <th className="text-right py-2 px-3 island-kicker">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {result.lignes.map((line, i) => (
                          <tr key={i} className="hover:bg-[var(--bg-inner)]/60 transition-colors">
                            <td className="py-1.5 px-3 text-[var(--text-base)]">{line.label}</td>
                            <td className="py-1.5 px-3 text-right text-[var(--text-soft)] tabular-nums hidden sm:table-cell">{fmt(line.base)}</td>
                            <td className="py-1.5 px-3 text-right text-[var(--text-soft)] tabular-nums">{fmtPct(line.rate)}</td>
                            <td className="py-1.5 px-3 text-right font-semibold text-[var(--brand)] tabular-nums">−{fmt(line.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-[var(--line)] bg-[var(--bg-inner)]">
                          <td className="py-2 px-3 text-sm font-bold text-[var(--text-base)]">Total cotisations</td>
                          <td className="py-2 px-3 hidden sm:table-cell" />
                          <td className="py-2 px-3 text-right text-[var(--text-soft)] tabular-nums">{tauxTotal != null ? fmtPct(tauxTotal) : '—'}</td>
                          <td className="py-2 px-3 text-right font-bold text-[var(--brand)] tabular-nums">−{fmt(result.totalSalarial)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                <Separator className="bg-[var(--line)]" />

                {/* ── Section PAS ── */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="island-kicker">Prélèvement à la source</p>
                    {result.tauxPas > 0 && tauxPasManuel === null && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[var(--brand)] bg-[var(--bg-inner)] border border-[var(--line)] rounded-full px-2.5 py-0.5">
                        <span className="w-1 h-1 rounded-full bg-[var(--brand)]" />
                        Estimé · {fmtPct(result.tauxPas)}
                      </span>
                    )}
                  </div>

                  {/* Slider taux PAS */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="pas-slider" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Taux PAS</label>
                      <div className="flex items-center gap-2">
                        {tauxPasManuel !== null && (
                          <button
                            type="button"
                            onClick={() => setTauxPasManuel(null)}
                            className="text-[10px] font-bold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors cursor-pointer"
                          >
                            Réinitialiser
                          </button>
                        )}
                        <span className="text-sm font-bold text-[var(--text-base)] tabular-nums min-w-[52px] text-right">
                          {fmtPct(tauxPasEffectif)}
                        </span>
                      </div>
                    </div>
                    <input
                      id="pas-slider"
                      type="range"
                      min={0}
                      max={45}
                      step={0.1}
                      value={tauxPasManuel !== null ? tauxPasManuel : result.tauxPas * 100}
                      onChange={e => setTauxPasManuel(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--bg-inner)]"
                      style={{ accentColor: 'var(--brand)' }}
                    />
                    <p className="text-[10px] text-[var(--text-ghost)] text-center mt-1">
                      Ajustez selon votre avis d'impôt · 0 % – 45 %
                    </p>
                  </div>

                  {/* ── Box net après PAS — rouge brand ── */}
                  <div className="relative overflow-hidden rounded-xl px-5 py-4"
                    style={{ background: 'linear-gradient(135deg, #f25353, #c94040)' }}
                  >
                    <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(255,255,255,0.12), transparent)' }} />
                    <p className="relative text-center mb-3 text-[10px] font-bold uppercase tracking-widest text-white/70">
                      Net après impôt
                    </p>
                    <div className="relative grid grid-cols-2">
                      <div className="text-center pr-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-white/70">Mensuel</p>
                        <p className="text-2xl font-black text-white tabular-nums leading-tight">
                          {netApresPasMensuel != null ? fmt(netApresPasMensuel) : '—'}
                        </p>
                        {pasMensuel != null && pasMensuel > 0 && (
                          <p className="text-[11px] mt-0.5 text-white/60">
                            dont −{fmt(pasMensuel)} PAS
                          </p>
                        )}
                      </div>
                      <div className="text-center border-l border-white/20 pl-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-white/70">Annuel</p>
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

        {/* ── Pied de page ── */}
        <footer className="text-center text-xs text-[var(--text-ghost)]">
          Un outil de{' '}
          <a href="https://lecuistotduweb.fr" target="_blank" rel="noopener noreferrer" className="font-semibold">
            LeCuistotduWeb
          </a>
          {' '}· Estimation indicative, non contractuelle
        </footer>

      </div>
    </div>
  )
}
