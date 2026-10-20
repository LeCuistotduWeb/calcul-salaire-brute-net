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

// ── Barème fiscal et social ───────────────────────────────────────────────────
// Source unique de vérité : pour passer à l'année suivante, dupliquer cet objet
// et basculer BAREME. Toutes les constantes sont nommées (aucun magic number
// dans les fonctions de calcul).
const BAREME_2025 = {
  // Plafond mensuel de la Sécurité sociale
  pmss: 3_925,

  // Cotisations salariales (taux appliqués aux tranches)
  cotisations: {
    retraiteBasePlafonnee: 0.069,
    retraiteBaseDeplafonnee: 0.004,
    agircArrcoT1: 0.0315,
    agircArrcoT2: 0.0864,
    cegT1: 0.0086,
    cegT2: 0.0108,
    cetT1: 0.0014, // cadres uniquement
    cetT2: 0.0021, // cadres uniquement
    csgDeductible: 0.068,
    csgNonDeductible: 0.024,
    crds: 0.005,
  },

  // CSG/CRDS : abattement 1,75 % pour frais pro sur la fraction ≤ 4 PMSS
  csg: {
    abattementFraisPro: 0.9825,
    plafondAbattementEnPmss: 4,
  },

  // Impôt sur le revenu — barème 2025 (revenus 2024)
  ir: {
    tranches: [
      { max: 11_497, taux: 0 },
      { max: 29_315, taux: 0.11 },
      { max: 83_823, taux: 0.3 },
      { max: 180_294, taux: 0.41 },
      { max: Infinity, taux: 0.45 },
    ],
    // Abattement 10 % sur les salaires (plancher / plafond annuels)
    abattement: { taux: 0.1, min: 495, max: 14_171 },
    // Décote
    decote: {
      seuilCelibataire: 1_939,
      seuilCouple: 3_166,
      maxCelibataire: 873,
      maxCouple: 1_444,
      taux: 0.4521,
    },
  },
} as const

const BAREME = BAREME_2025

/** Plafond mensuel de la Sécurité sociale pour l'année en cours. */
export const PMSS_MENSUEL = BAREME.pmss

function computeIR(revenuImposable: number, parts: number): number {
  const qi = revenuImposable / parts
  let ir = 0
  let prev = 0
  for (const { max, taux } of BAREME.ir.tranches) {
    if (qi <= prev) break
    ir += (Math.min(qi, max) - prev) * taux
    prev = max
  }
  ir *= parts
  if (ir <= 0) return 0

  // Décote
  const { decote } = BAREME.ir
  const couple = parts >= 2
  const seuil = couple ? decote.seuilCouple : decote.seuilCelibataire
  const decoteMax = couple ? decote.maxCouple : decote.maxCelibataire
  if (ir < seuil) ir = Math.max(0, ir - Math.max(0, decoteMax - decote.taux * ir))
  return ir
}

function computeMonthly(brut: number, statut: Statut, parts: number): SalaryResult {
  const { cotisations: c, csg } = BAREME
  const pmss = BAREME.pmss
  const t1 = Math.min(brut, pmss)
  const t2 = Math.max(0, Math.min(brut - pmss, pmss * 7))

  // Abattement 1,75 % pour frais pro sur fraction ≤ 4 PMSS
  const base4p = pmss * csg.plafondAbattementEnPmss
  const baseCsg =
    brut <= base4p
      ? brut * csg.abattementFraisPro
      : base4p * csg.abattementFraisPro + (brut - base4p)

  const lignes: ContributionLine[] = []

  const add = (label: string, base: number, rate: number) => {
    if (base > 0 && rate > 0) lignes.push({ label, base, rate, amount: base * rate })
  }

  // Retraite de base (Sécu)
  add('Retraite de base plafonnée', t1, c.retraiteBasePlafonnee)
  add('Retraite de base déplafonnée', brut, c.retraiteBaseDeplafonnee)

  // AGIRC-ARRCO
  add('Retraite complémentaire (T1)', t1, c.agircArrcoT1)
  if (t2 > 0) add('Retraite complémentaire (T2)', t2, c.agircArrcoT2)

  // CEG
  add('Contribution équilibre général (T1)', t1, c.cegT1)
  if (t2 > 0) add('Contribution équilibre général (T2)', t2, c.cegT2)

  // CET — cadres uniquement
  if (statut === 'cadre') {
    add('Contribution équilibre technique (T1)', t1, c.cetT1)
    if (t2 > 0) add('Contribution équilibre technique (T2)', t2, c.cetT2)
  }

  // CSG / CRDS
  add("CSG déductible de l'impôt", baseCsg, c.csgDeductible)
  add('CSG non déductible', baseCsg, c.csgNonDeductible)
  add('CRDS', baseCsg, c.crds)

  const totalSalarial = lignes.reduce((s, l) => s + l.amount, 0)
  const net = brut - totalSalarial

  // Net imposable = net + CSG non déductible + CRDS (non déductibles de l'IR)
  const netImposable = net + baseCsg * (c.csgNonDeductible + c.crds)

  // PAS : annualiser pour calculer le taux, puis appliquer mensuellement
  const { abattement: ab } = BAREME.ir
  const netImposableAnnuel = netImposable * 12
  const abattement = Math.max(ab.min, Math.min(ab.max, netImposableAnnuel * ab.taux))
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
