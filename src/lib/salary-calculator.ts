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
  netImposable: number
  totalSalarial: number
  lignes: ContributionLine[]
  pas: number
  tauxPas: number
  netApresPas: number
}

// Barème IR 2025 (revenus 2024)
const BAREME_IR = [
  { max: 11_497, taux: 0 },
  { max: 29_315, taux: 0.11 },
  { max: 83_823, taux: 0.3 },
  { max: 180_294, taux: 0.41 },
  { max: Infinity, taux: 0.45 },
] as const

function computeIR(revenuImposable: number, parts: number): number {
  const qi = revenuImposable / parts
  let ir = 0
  let prev = 0
  for (const { max, taux } of BAREME_IR) {
    if (qi <= prev) break
    ir += (Math.min(qi, max) - prev) * taux
    prev = max
  }
  ir *= parts
  if (ir <= 0) return 0

  // Décote 2025
  const couple = parts >= 2
  const seuil = couple ? 3_166 : 1_939
  const decoteMax = couple ? 1_444 : 873
  if (ir < seuil) ir = Math.max(0, ir - Math.max(0, decoteMax - 0.4521 * ir))
  return ir
}

function computeMonthly(brut: number, statut: Statut, parts: number): SalaryResult {
  const pmss = PMSS_MENSUEL
  const t1 = Math.min(brut, pmss)
  const t2 = Math.max(0, Math.min(brut - pmss, pmss * 7))

  // Abattement 1,75 % pour frais pro sur fraction ≤ 4 PMSS
  const base4p = pmss * 4
  const baseCsg = brut <= base4p ? brut * 0.9825 : base4p * 0.9825 + (brut - base4p)

  const lignes: ContributionLine[] = []

  const add = (label: string, base: number, rate: number) => {
    if (base > 0 && rate > 0) lignes.push({ label, base, rate, amount: base * rate })
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
  const net = brut - totalSalarial

  // Net imposable = net + CSG non déductible + CRDS (non déductibles de l'IR)
  const netImposable = net + baseCsg * 0.029

  // PAS : annualiser pour calculer le taux, puis appliquer mensuellement
  const netImposableAnnuel = netImposable * 12
  const abattement = Math.max(495, Math.min(14_171, netImposableAnnuel * 0.1))
  const revenuImposable = Math.max(0, netImposableAnnuel - abattement)
  const irAnnuel = computeIR(revenuImposable, parts)
  const tauxPas = netImposableAnnuel > 0 ? irAnnuel / netImposableAnnuel : 0
  const pas = netImposable * tauxPas

  return {
    brut,
    net,
    netImposable,
    totalSalarial,
    lignes,
    pas,
    tauxPas,
    netApresPas: net - pas,
  }
}

function scale(r: SalaryResult, f: number): SalaryResult {
  return {
    brut: r.brut * f,
    net: r.net * f,
    netImposable: r.netImposable * f,
    totalSalarial: r.totalSalarial * f,
    lignes: r.lignes.map((l) => ({ ...l, base: l.base * f, amount: l.amount * f })),
    pas: r.pas * f,
    tauxPas: r.tauxPas,
    netApresPas: r.netApresPas * f,
  }
}

function grossFromNet(netMensuel: number, statut: Statut, parts: number): number {
  let lo = netMensuel
  let hi = netMensuel * 1.45
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2
    if (computeMonthly(mid, statut, parts).net < netMensuel) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function calculate(
  value: number,
  periode: Periode,
  direction: Direction,
  statut: Statut,
  parts: number,
): SalaryResult {
  const mensuel = periode === 'annuel' ? value / 12 : value
  const brut = direction === 'net-to-brut' ? grossFromNet(mensuel, statut, parts) : mensuel
  const result = computeMonthly(brut, statut, parts)
  return periode === 'annuel' ? scale(result, 12) : result
}
// feature example
