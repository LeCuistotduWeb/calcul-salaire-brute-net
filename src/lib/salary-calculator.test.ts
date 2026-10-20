import { describe, it, expect } from 'vitest'
import { calculate, PMSS_MENSUEL } from './salary-calculator'

// ── Helpers ──────────────────────────────────────────────────────────────────

const brut = (value: number, statut: 'non-cadre' | 'cadre' = 'non-cadre') =>
  calculate(value, 'mensuel', 'brut-to-net', statut, 1)

const annual = (value: number) =>
  calculate(value, 'annuel', 'brut-to-net', 'non-cadre', 1)

const netToGross = (net: number, statut: 'non-cadre' | 'cadre' = 'non-cadre') =>
  calculate(net, 'mensuel', 'net-to-brut', statut, 1)

// ── Brut → Net ───────────────────────────────────────────────────────────────

describe('brut → net (mensuel)', () => {
  it('le net est inférieur au brut', () => {
    const r = brut(3000)
    expect(r.net).toBeLessThan(r.brut)
  })

  it('les cotisations = somme des lignes', () => {
    const r = brut(3000)
    const sumLignes = r.lignes.reduce((s, l) => s + l.amount, 0)
    expect(r.totalSalarial).toBeCloseTo(sumLignes, 5)
  })

  it('net = brut − cotisations', () => {
    const r = brut(3000)
    expect(r.net).toBeCloseTo(r.brut - r.totalSalarial, 5)
  })

  it('3 000 € brut non-cadre → ~2 375 € net', () => {
    const r = brut(3000)
    expect(r.net).toBeCloseTo(2374.8, 0)
  })

  it('5 000 € brut non-cadre → net correct (sous le plafond)', () => {
    const r = brut(5000)
    expect(r.net).toBeGreaterThan(3500)
    expect(r.net).toBeLessThan(5000)
  })

  it('cadre a des cotisations supplémentaires (CET)', () => {
    const nonCadre = brut(3000, 'non-cadre')
    const cadre = brut(3000, 'cadre')
    expect(cadre.totalSalarial).toBeGreaterThan(nonCadre.totalSalarial)
    expect(cadre.net).toBeLessThan(nonCadre.net)
  })

  it("au-dessus du PMSS, la T2 AGIRC-ARRCO s'applique", () => {
    const r = brut(PMSS_MENSUEL + 1000)
    const t2Lines = r.lignes.filter(l => l.label.includes('T2'))
    expect(t2Lines.length).toBeGreaterThan(0)
  })

  it('le taux de cotisations est entre 20 % et 30 % pour un salaire standard', () => {
    const r = brut(3000)
    const taux = r.totalSalarial / r.brut
    expect(taux).toBeGreaterThan(0.20)
    expect(taux).toBeLessThan(0.30)
  })
})

// ── Annuel ───────────────────────────────────────────────────────────────────

describe('période annuelle', () => {
  it('les valeurs annuelles = valeurs mensuelles × 12', () => {
    const mensuel = brut(3000)
    const ann = annual(3000 * 12)
    expect(ann.brut).toBeCloseTo(mensuel.brut * 12, 0)
    expect(ann.net).toBeCloseTo(mensuel.net * 12, 0)
    expect(ann.totalSalarial).toBeCloseTo(mensuel.totalSalarial * 12, 0)
  })

  it('le taux de cotisations est identique en mensuel et annuel', () => {
    const mensuel = brut(3000)
    const ann = annual(36000)
    const tauxM = mensuel.totalSalarial / mensuel.brut
    const tauxA = ann.totalSalarial / ann.brut
    expect(tauxA).toBeCloseTo(tauxM, 5)
  })
})

// ── Net → Brut ───────────────────────────────────────────────────────────────

describe('net → brut', () => {
  it('roundtrip : brut → net → brut', () => {
    const initial = 3500
    const net = brut(initial).net
    const recovered = netToGross(net).brut
    expect(recovered).toBeCloseTo(initial, 0)
  })

  it('le brut retrouvé est supérieur au net saisi', () => {
    const r = netToGross(2500)
    expect(r.brut).toBeGreaterThan(2500)
  })

  it('roundtrip pour un cadre', () => {
    const initial = 4000
    const net = brut(initial, 'cadre').net
    const recovered = netToGross(net, 'cadre').brut
    expect(recovered).toBeCloseTo(initial, 0)
  })
})

// ── Prélèvement à la source ──────────────────────────────────────────────────

describe('prélèvement à la source', () => {
  it("PAS = 0 sous le seuil d'imposition", () => {
    // Revenu net imposable annuel < 11 497 € → pas d'IR
    const r = calculate(700, 'mensuel', 'brut-to-net', 'non-cadre', 1)
    expect(r.tauxPas).toBe(0)
    expect(r.pas).toBe(0)
  })

  it('le taux PAS augmente avec le salaire', () => {
    const r1 = calculate(3000, 'mensuel', 'brut-to-net', 'non-cadre', 1)
    const r2 = calculate(6000, 'mensuel', 'brut-to-net', 'non-cadre', 1)
    expect(r2.tauxPas).toBeGreaterThan(r1.tauxPas)
  })

  it('plus de parts → taux PAS plus bas', () => {
    const r1 = calculate(4000, 'mensuel', 'brut-to-net', 'non-cadre', 1)
    const r2 = calculate(4000, 'mensuel', 'brut-to-net', 'non-cadre', 2)
    expect(r2.tauxPas).toBeLessThan(r1.tauxPas)
  })

  it('net après PAS = net − PAS', () => {
    const r = calculate(3000, 'mensuel', 'brut-to-net', 'non-cadre', 1)
    expect(r.netApresPas).toBeCloseTo(r.net - r.pas, 5)
  })

  it('net après PAS ≤ net social', () => {
    const r = calculate(3000, 'mensuel', 'brut-to-net', 'non-cadre', 1)
    expect(r.netApresPas).toBeLessThanOrEqual(r.net)
  })

  it('le taux PAS annuel reste cohérent avec le mensuel', () => {
    const mensuel = calculate(3000, 'mensuel', 'brut-to-net', 'non-cadre', 1)
    const annuel = calculate(36000, 'annuel', 'brut-to-net', 'non-cadre', 1)
    expect(annuel.tauxPas).toBeCloseTo(mensuel.tauxPas, 5)
  })
})

// ── Cas limites ───────────────────────────────────────────────────────────────

describe('cas limites', () => {
  it('SMIG (1 801 € brut) → net positif', () => {
    const r = brut(1801)
    expect(r.net).toBeGreaterThan(0)
  })

  it('très haut salaire (20 000 €) → T2 présente, taux < 30 %', () => {
    const r = brut(20000)
    const t2 = r.lignes.find(l => l.label.includes('T2'))
    expect(t2).toBeDefined()
    const taux = r.totalSalarial / r.brut
    expect(taux).toBeLessThan(0.30)
  })
})
