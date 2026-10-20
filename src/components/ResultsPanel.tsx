import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ContributionTable } from '@/components/ContributionTable'
import { fmt, fmtPct } from '@/lib/formatters'
import type { SalaryResult, Direction, Periode } from '@/lib/salary-calculator'

interface ResultsPanelProps {
  result: SalaryResult | null
  direction: Direction
  periode: Periode
  showDetail: boolean
  onToggleDetail: () => void
  tauxPasManuel: number | null
  onTauxPasChange: (pct: number) => void
  onTauxPasReset: () => void
}

export function ResultsPanel({
  result,
  direction,
  periode,
  showDetail,
  onToggleDetail,
  tauxPasManuel,
  onTauxPasChange,
  onTauxPasReset,
}: ResultsPanelProps) {
  if (result == null) {
    return (
      <div className="island-shell rounded-2xl overflow-hidden">
        <div className="flex flex-col items-center justify-center min-h-[340px] gap-3 text-center px-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-inner)] border border-[var(--line)] flex items-center justify-center mb-1">
            <svg
              className="w-6 h-6 text-[var(--text-ghost)]"
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
          <p className="text-sm text-[var(--text-soft)] font-medium">
            Saisissez un salaire à gauche
            <br />
            pour voir vos résultats
          </p>
        </div>
      </div>
    )
  }

  const outputValue = direction === 'brut-to-net' ? result.net : result.brut
  const secondary = periode === 'mensuel' ? outputValue * 12 : outputValue / 12
  const tauxTotal = result.totalSalarial / result.brut
  const tauxPasEffectif = tauxPasManuel !== null ? tauxPasManuel / 100 : result.tauxPas
  const netBase = periode === 'mensuel' ? result.net : result.net / 12
  const netApresPasMensuel = netBase * (1 - tauxPasEffectif)
  const netApresPasAnnuel = netBase * 12 * (1 - tauxPasEffectif)
  const pasMensuel = netBase * tauxPasEffectif

  const outputLabel =
    direction === 'brut-to-net'
      ? `Net social ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`
      : `Brut ${periode === 'mensuel' ? 'mensuel' : 'annuel'}`

  return (
    <div className="island-shell rounded-2xl overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Main result */}
        <div
          className="relative overflow-hidden rounded-xl px-6 py-5 text-center"
          style={{ background: 'linear-gradient(135deg, #253c59, #1a2d45)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at top right, rgba(255,255,255,0.12), transparent)',
            }}
          />
          <p className="island-kicker relative" style={{ color: 'rgba(193,210,228,0.7)' }}>
            {outputLabel}
          </p>
          <p className="relative text-5xl font-black text-white tabular-nums tracking-tight mt-1">
            {fmt(outputValue)}
          </p>
          <p className="relative text-sm mt-2" style={{ color: 'rgba(193,210,228,0.8)' }}>
            soit <span className="font-bold text-white">{fmt(secondary)}</span> par{' '}
            {periode === 'mensuel' ? 'an' : 'mois'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Brut', value: fmt(result.brut), className: 'text-[var(--text-base)]' },
            {
              label: 'Cotisations',
              value: `−${fmt(result.totalSalarial)}`,
              className: 'text-[var(--brand)]',
            },
            { label: 'Taux', value: fmtPct(tauxTotal), className: 'text-[var(--text-base)]' },
          ].map(({ label, value, className }) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--line)] bg-[var(--bg-inner)] p-3 text-center"
            >
              <p className="island-kicker mb-1">{label}</p>
              <p className={cn('text-sm font-bold tabular-nums', className)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Detail toggle */}
        <button
          type="button"
          onClick={onToggleDetail}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-[var(--text-soft)] hover:text-[var(--text-base)] transition-colors py-0.5 cursor-pointer"
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
            tauxTotal={tauxTotal}
          />
        )}

        <Separator className="bg-[var(--line)]" />

        {/* PAS section */}
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
              onChange={(e) => onTauxPasChange(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--bg-inner)]"
              style={{ accentColor: 'var(--brand)' }}
            />
            <p className="text-[10px] text-[var(--text-ghost)] text-center mt-1">
              Ajustez selon votre avis d'impôt · 0 % – 45 %
            </p>
          </div>

          {/* Net après PAS */}
          <div
            className="relative overflow-hidden rounded-xl px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #f25353, #c94040)' }}
          >
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
                  {fmt(netApresPasMensuel)}
                </p>
                {pasMensuel > 0 && (
                  <p className="text-[11px] mt-0.5 text-white/60">dont −{fmt(pasMensuel)} PAS</p>
                )}
              </div>
              <div className="text-center border-l border-white/20 pl-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-white/70">
                  Annuel
                </p>
                <p className="text-2xl font-black text-white tabular-nums leading-tight">
                  {fmt(netApresPasAnnuel)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
