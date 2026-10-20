import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ContributionTable } from '@/components/ContributionTable'
import { fmt, fmtPct } from '@/lib/formatters'
import type { SalaryResult } from '@/lib/salary-calculator'
import type { SalaryDerived } from '@/hooks/useSalaryForm'

interface ResultsPanelProps {
  result: SalaryResult | null
  derived: SalaryDerived | null
  showDetail: boolean
  onToggleDetail: () => void
  tauxPasManuel: number | null
  onTauxPasChange: (pct: number) => void
  onTauxPasReset: () => void
}

export function ResultsPanel({
  result,
  derived,
  showDetail,
  onToggleDetail,
  tauxPasManuel,
  onTauxPasChange,
  onTauxPasReset,
}: ResultsPanelProps) {
  if (result == null || derived == null) {
    return (
      <div className="island-shell rounded-2xl overflow-hidden">
        <div className="flex flex-col items-center justify-center min-h-[340px] gap-3 text-center px-8">
          <div className="w-14 h-14 rounded-2xl bg-sunken border border-line flex items-center justify-center mb-1">
            <svg
              className="w-6 h-6 text-ghost"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p className="text-sm text-soft font-medium">
            Saisissez un salaire à gauche
            <br />
            pour voir vos résultats
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="island-shell rounded-2xl overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Main result */}
        <div className="gradient-navy relative overflow-hidden rounded-xl px-6 py-5 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at top right, rgba(255,255,255,0.12), transparent)',
            }}
          />
          <p className="island-kicker relative text-on-navy/70">{derived.outputLabel}</p>
          <p className="relative text-5xl font-black text-white tabular-nums tracking-tight mt-1">
            {fmt(derived.outputValue)}
          </p>
          <p className="relative text-sm mt-2 text-on-navy/80">
            soit <span className="font-bold text-white">{fmt(derived.secondary)}</span> par{' '}
            {derived.secondaryUnit}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Brut', value: fmt(result.brut), className: 'text-foreground' },
            {
              label: 'Cotisations',
              value: `−${fmt(result.totalSalarial)}`,
              className: 'text-brand',
            },
            { label: 'Taux', value: fmtPct(derived.tauxTotal), className: 'text-foreground' },
          ].map(({ label, value, className }) => (
            <div key={label} className="rounded-xl border border-line bg-sunken p-3 text-center">
              <p className="island-kicker mb-1">{label}</p>
              <p className={cn('text-sm font-bold tabular-nums', className)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Detail toggle */}
        <button
          type="button"
          onClick={onToggleDetail}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-soft hover:text-foreground transition-colors py-0.5 cursor-pointer"
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showDetail ? 'Masquer le détail' : 'Voir le détail des cotisations'}
        </button>

        {showDetail && (
          <ContributionTable
            lignes={result.lignes}
            totalSalarial={result.totalSalarial}
            tauxTotal={derived.tauxTotal}
          />
        )}

        <Separator className="bg-line" />

        {/* PAS section */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <p className="island-kicker">Prélèvement à la source</p>
            {result.tauxPas > 0 && tauxPasManuel === null && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand bg-sunken border border-line rounded-full px-2.5 py-0.5">
                <span className="w-1 h-1 rounded-full bg-brand" />
                Estimé · {fmtPct(result.tauxPas)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="pas-slider"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Taux PAS
              </label>
              <div className="flex items-center gap-2">
                {tauxPasManuel !== null && (
                  <button
                    type="button"
                    onClick={onTauxPasReset}
                    className="text-[10px] font-bold text-brand hover:text-brand-hover transition-colors cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                )}
                <span className="text-sm font-bold text-foreground tabular-nums min-w-[52px] text-right">
                  {fmtPct(derived.tauxPasEffectif)}
                </span>
              </div>
            </div>
            <input
              id="pas-slider"
              type="range"
              min={0}
              max={45}
              step={0.1}
              value={derived.sliderValue}
              onChange={(e) => onTauxPasChange(parseFloat(e.target.value))}
              aria-valuetext={fmtPct(derived.tauxPasEffectif)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-sunken"
              style={{ accentColor: 'var(--brand)' }}
            />
            <p className="text-[10px] text-ghost text-center mt-1">
              Ajustez selon votre avis d'impôt · 0 % – 45 %
            </p>
          </div>

          {/* Net après PAS */}
          <div className="gradient-brand relative overflow-hidden rounded-xl px-5 py-4">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at bottom left, rgba(255,255,255,0.12), transparent)',
              }}
            />
            <p className="relative text-center mb-3 text-[10px] font-bold uppercase tracking-widest text-white/70">
              Net après impôt
            </p>
            <div className="relative grid grid-cols-2">
              <div className="text-center pr-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-white/70">
                  Mensuel
                </p>
                <p className="text-2xl font-black text-white tabular-nums leading-tight">
                  {fmt(derived.netApresPasMensuel)}
                </p>
                {derived.pasMensuel > 0 && (
                  <p className="text-[11px] mt-0.5 text-white/60">
                    dont −{fmt(derived.pasMensuel)} PAS
                  </p>
                )}
              </div>
              <div className="text-center border-l border-white/20 pl-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-white/70">
                  Annuel
                </p>
                <p className="text-2xl font-black text-white tabular-nums leading-tight">
                  {fmt(derived.netApresPasAnnuel)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
