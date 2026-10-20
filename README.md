# Simulateur salaire brut / net

Outil de simulation des cotisations sociales françaises — barème 2025.  
Calcul brut → net et net → brut, avec prélèvement à la source (PAS).

**[→ Voir l'outil en ligne](https://salaire-net-brut.lecuistotduweb.fr)**

## Fonctionnalités

- Conversion brut ↔ net (secteur privé, barème 2025)
- Statut non-cadre / cadre (cotisations CET)
- Calcul mensuel ou annuel
- Prélèvement à la source estimé selon les parts fiscales (1 à 3)
- Slider PAS ajustable selon l'avis d'imposition
- Détail ligne par ligne des cotisations salariales
- Mode sombre / clair persisté en localStorage

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · shadcn/ui

## Lancer en local

```bash
pnpm install
pnpm dev
```

## Commandes

```bash
pnpm build          # Build production
pnpm test:unit      # Tests unitaires (vitest)
pnpm test:e2e       # Tests E2E (playwright)
pnpm lint           # oxlint
pnpm format         # prettier
```

## Contribuer

Les PRs sont les bienvenues. Merci de passer par une feature branch et d'ouvrir une PR vers `main`.  
Les hooks pre-commit vérifient lint + format. Le push exécute la suite complète (unit + E2E).

## Licence

[MIT](LICENSE) · Un outil de [LeCuistotduWeb](https://lecuistotduweb.fr)
