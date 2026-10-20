import { useDarkMode } from '@/hooks/useDarkMode'
import { useSalaryForm } from '@/hooks/useSalaryForm'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { ParamsPanel } from '@/components/ParamsPanel'
import { ResultsPanel } from '@/components/ResultsPanel'

export default function SalaryCalculator() {
  const { dark, toggle: toggleDark } = useDarkMode()
  const form = useSalaryForm()

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl flex flex-col gap-7">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="island-kicker mb-2">Outil · Barème 2025</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-black tracking-tight leading-tight text-[var(--text-base)]">
              Simulateur salaire <span className="text-[var(--brand)]">brut&nbsp;/&nbsp;net</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Cotisations sociales · Prélèvement à la source · Secteur privé
            </p>
          </div>
          <DarkModeToggle dark={dark} onToggle={toggleDark} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">
          <ParamsPanel
            periode={form.periode}
            onPeriodeChange={form.setPeriode}
            statut={form.statut}
            onStatutChange={form.setStatut}
            direction={form.direction}
            onDirectionChange={form.setDirection}
            inputValue={form.inputValue}
            onInputChange={form.setInputValue}
            inputLabel={form.inputLabel}
            parts={form.parts}
            onPartsChange={form.handlePartsChange}
          />
          <ResultsPanel
            result={form.result}
            direction={form.direction}
            periode={form.periode}
            showDetail={form.showDetail}
            onToggleDetail={form.toggleDetail}
            tauxPasManuel={form.tauxPasManuel}
            onTauxPasChange={form.handleTauxPasChange}
            onTauxPasReset={form.resetTauxPas}
          />
        </div>

        <footer className="text-center text-xs text-[var(--text-ghost)]">
          Un outil de{' '}
          <a
            href="https://lecuistotduweb.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold"
          >
            LeCuistotduWeb
          </a>{' '}
          · Estimation indicative, non contractuelle
        </footer>
      </div>
    </div>
  )
}
