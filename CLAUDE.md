# Simulateur salaire brut / net

React 19 + Vite 8 + TypeScript + Tailwind 4 + shadcn/ui. Outil de simulation des cotisations sociales françaises (barème 2025).

## Commandes

```bash
pnpm dev          # serveur de dev
pnpm build        # build production (tsc + vite)
pnpm lint         # oxlint
pnpm format       # prettier --write
pnpm test:unit    # vitest (run once)
pnpm test:unit:watch  # vitest watch
pnpm test:e2e     # playwright (nécessite un serveur actif)
pnpm test:e2e:ui  # playwright UI mode
```

## Architecture

```
src/
  components/
    ui/                    # Primitives shadcn — ne pas modifier manuellement
    PillToggle.tsx         # Groupe radio en pills (réutilisable)
    DarkModeToggle.tsx     # Bouton header dark/light (lucide-react)
    ContributionTable.tsx  # Tableau détaillé des cotisations
    ParamsPanel.tsx        # Panneau gauche : formulaire de paramètres
    ResultsPanel.tsx       # Panneau droit : résultats + PAS
    SalaryCalculator.tsx   # Orchestrateur de page (pas de logique)
  hooks/
    useDarkMode.ts         # État dark mode + localStorage
    useSalaryForm.ts       # État formulaire + valeurs dérivées + actions
  lib/
    salary-calculator.ts   # Moteur de calcul (fonctions pures, sans framework)
    salary-calculator.test.ts
    formatters.ts          # fmt() devise · fmtPct() pourcentage
    utils.ts               # cn() depuis 'cn'
```

## Conventions

- La logique métier vit dans `src/lib/` : fonctions pures, testables sans React.
- L'état et les valeurs dérivées vivent dans les hooks (`src/hooks/`).
- Les composants sont display-only : ils reçoivent des props, émettent des callbacks.
- `SalaryCalculator` est l'orchestrateur : il instancie les hooks et câble les composants.
- Formatage monétaire : toujours `fmt()`. Pourcentages : toujours `fmtPct()`.
- Les constantes fiscales (PMSS, barèmes IR) vivent dans `salary-calculator.ts`.

## Tests

- **Unit** : couvrir toute la logique dans `salary-calculator.test.ts`. Les composants ne sont pas testés unitairement (logique déportée dans les fonctions pures).
- **E2E** : `e2e/calculator.spec.ts` couvre les flux utilisateur critiques via Playwright.
- **Pre-commit** : scan secrets + lint + format check.
- **Pre-push** : format check + lint + tests unitaires + tests E2E.

## Workflow git

**Toujours créer une branche avant de commencer** — jamais de commit direct sur `main`.

Convention de nommage des branches :

- `feat/<sujet>` — nouvelle fonctionnalité
- `fix/<sujet>` — correction de bug
- `chore/<sujet>` — tooling, config, refactoring sans impact utilisateur

Le nom doit refléter ce que fait la branche (ex: `feat/cotisations-patronales`, `fix/pas-calcul-annuel`). Il peut être renommé si le scope évolue.

Un hook `PreToolUse` bloque les `git commit` directs sur `main` / `master`.

## Ajouter une feature

1. Si logique de calcul → ajouter dans `salary-calculator.ts` + tests unitaires.
2. Si état/dérivé → étendre `useSalaryForm.ts`.
3. Si nouveau bloc UI indépendant → nouveau composant dans `src/components/`.
4. Câbler dans `SalaryCalculator.tsx` via les hooks et les props.
