export const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(v))

export const fmtPct = (v: number) => (v * 100).toFixed(2).replace('.', ',') + ' %'
