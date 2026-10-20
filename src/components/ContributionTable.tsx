import { fmt, fmtPct } from '@/lib/formatters'
import type { ContributionLine } from '@/lib/salary-calculator'

interface ContributionTableProps {
  lignes: ContributionLine[]
  totalSalarial: number
  tauxTotal: number
}

export function ContributionTable({ lignes, totalSalarial, tauxTotal }: ContributionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line text-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-line bg-sunken">
            <th className="text-left py-2 px-3 island-kicker">Cotisation salariale</th>
            <th className="text-right py-2 px-3 island-kicker hidden sm:table-cell">Base</th>
            <th className="text-right py-2 px-3 island-kicker">Taux</th>
            <th className="text-right py-2 px-3 island-kicker">Montant</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {lignes.map((line) => (
            <tr key={line.label} className="hover:bg-sunken/60 transition-colors">
              <td className="py-1.5 px-3 text-foreground">{line.label}</td>
              <td className="py-1.5 px-3 text-right text-soft tabular-nums hidden sm:table-cell">
                {fmt(line.base)}
              </td>
              <td className="py-1.5 px-3 text-right text-soft tabular-nums">{fmtPct(line.rate)}</td>
              <td className="py-1.5 px-3 text-right font-semibold text-brand tabular-nums">
                −{fmt(line.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-sunken">
            <td className="py-2 px-3 text-sm font-bold text-foreground">Total cotisations</td>
            <td className="py-2 px-3 hidden sm:table-cell" />
            <td className="py-2 px-3 text-right text-soft tabular-nums">{fmtPct(tauxTotal)}</td>
            <td className="py-2 px-3 text-right font-bold text-brand tabular-nums">
              −{fmt(totalSalarial)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
