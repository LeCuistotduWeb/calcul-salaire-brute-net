export const PMSS_MENSUEL = 3_925 // 2025

export type Statut = 'non-cadre' | 'cadre'
export type Periode = 'mensuel' | 'annuel'
export type Direction = 'brut-to-net' | 'net-to-brut'

export interface ContributionLine {
  label: string
  base: number
  rate: number
  amount: number
}

export interface SalaryResult {
  brut: number
  net: number
  totalSalarial: number
  lignes: ContributionLine[]
}

function computeMonthly(brut: number, statut: Statut): SalaryResult {
  const pmss = PMSS_MENSUEL
  const t1 = Math.min(brut, pmss)
  const t2 = Math.max(0, Math.min(brut - pmss, pmss * 7))

  // Abattement 1,75 % pour frais pro sur fraction ≤ 4 PMSS
  const base4p = pmss * 4
  const baseCsg =
    brut <= base4p ? brut * 0.9825 : base4p * 0.9825 + (brut - base4p)

  const lignes: ContributionLine[] = []

  const add = (label: string, base: number, rate: number) => {
    if (base > 0 && rate > 0)
      lignes.push({ label, base, rate, amount: base * rate })
  }

  // Retraite de base (Sécu)
  add('Retraite de base plafonnée', t1, 0.069)
  add('Retraite de base déplafonnée', brut, 0.004)

  // AGIRC-ARRCO
  add('Retraite complémentaire (T1)', t1, 0.0315)
  if (t2 > 0) add('Retraite complémentaire (T2)', t2, 0.0864)

  // CEG
  add('Contribution équilibre général (T1)', t1, 0.0086)
  if (t2 > 0) add('Contribution équilibre général (T2)', t2, 0.0108)

  // CET — cadres uniquement
  if (statut === 'cadre') {
    add('Contribution équilibre technique (T1)', t1, 0.0014)
    if (t2 > 0) add('Contribution équilibre technique (T2)', t2, 0.0021)
  }

  // CSG / CRDS
  add("CSG déductible de l'impôt", baseCsg, 0.068)
  add('CSG non déductible', baseCsg, 0.024)
  add('CRDS', baseCsg, 0.005)

  const totalSalarial = lignes.reduce((s, l) => s + l.amount, 0)

  return { brut, net: brut - totalSalarial, totalSalarial, lignes }
}

function scale(r: SalaryResult, f: number): SalaryResult {
  return {
    brut: r.brut * f,
    net: r.net * f,
    totalSalarial: r.totalSalarial * f,
    lignes: r.lignes.map(l => ({ ...l, base: l.base * f, amount: l.amount * f })),
  }
}

function grossFromNet(netMensuel: number, statut: Statut): number {
  let lo = netMensuel
  let hi = netMensuel * 1.45
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2
    if (computeMonthly(mid, statut).net < netMensuel) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function calculate(
  value: number,
  periode: Periode,
  direction: Direction,
  statut: Statut,
): SalaryResult {
  const mensuel = periode === 'annuel' ? value / 12 : value
  const brut =
    direction === 'net-to-brut' ? grossFromNet(mensuel, statut) : mensuel
  const result = computeMonthly(brut, statut)
  return periode === 'annuel' ? scale(result, 12) : result
}
