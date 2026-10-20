import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { PillToggle } from '@/components/PillToggle'
import { fmt } from '@/lib/formatters'
import { PMSS_MENSUEL } from '@/lib/salary-calculator'
import type { Periode, Direction, Statut } from '@/lib/salary-calculator'

const PARTS_OPTIONS = [
  { value: 1, label: '1' },
  { value: 1.5, label: '1,5' },
  { value: 2, label: '2' },
  { value: 2.5, label: '2,5' },
  { value: 3, label: '3' },
]

interface ParamsPanelProps {
  periode: Periode
  onPeriodeChange: (v: Periode) => void
  statut: Statut
  onStatutChange: (v: Statut) => void
  direction: Direction
  onDirectionChange: (v: Direction) => void
  inputValue: string
  onInputChange: (v: string) => void
  inputLabel: string
  parts: number
  onPartsChange: (v: number) => void
}

export function ParamsPanel({
  periode,
  onPeriodeChange,
  statut,
  onStatutChange,
  direction,
  onDirectionChange,
  inputValue,
  onInputChange,
  inputLabel,
  parts,
  onPartsChange,
}: ParamsPanelProps) {
  return (
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
          onChange={onPeriodeChange}
        />
        <PillToggle
          legend="Statut"
          options={[
            { value: 'non-cadre' as Statut, label: 'Non-cadre' },
            { value: 'cadre' as Statut, label: 'Cadre' },
          ]}
          value={statut}
          onChange={onStatutChange}
        />
      </div>

      <PillToggle
        legend="Sens du calcul"
        options={[
          { value: 'brut-to-net' as Direction, label: 'Brut → Net' },
          { value: 'net-to-brut' as Direction, label: 'Net → Brut' },
        ]}
        value={direction}
        onChange={onDirectionChange}
      />

      <div>
        <label
          htmlFor="salary-input"
          className="block text-sm font-semibold text-foreground mb-1.5"
        >
          {inputLabel}
        </label>
        <div className="relative">
          <Input
            id="salary-input"
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="text-xl font-bold pr-10 h-12 rounded-xl bg-surface border-line focus-visible:ring-brand/30 focus-visible:border-brand"
            placeholder="3 000"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ghost font-semibold pointer-events-none select-none text-lg">
            €
          </span>
        </div>
      </div>

      <Separator className="bg-line" />

      <PillToggle
        legend="Parts fiscales (PAS)"
        options={PARTS_OPTIONS}
        value={parts}
        onChange={onPartsChange}
      />

      <div className="rounded-xl bg-sunken border border-line px-3.5 py-3 text-xs text-soft leading-relaxed">
        PMSS mensuel 2025 : <span className="font-bold text-foreground">{fmt(PMSS_MENSUEL)}</span> ·
        Hors conventions collectives · Barème IR 2025
      </div>
    </div>
  )
}
