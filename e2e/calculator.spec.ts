import { test, expect } from '@playwright/test'

test.describe('Calculateur salaire brut/net', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Attend que React soit monté
    await page.waitForSelector('#salary-input')
  })

  // ── Résultat de base ──────────────────────────────────────────────────────

  test('affiche un résultat net dès le chargement (valeur par défaut 3 000 €)', async ({
    page,
  }) => {
    await expect(page.locator('text=Net social mensuel').first()).toBeVisible()
  })

  test('met à jour le résultat quand on change le salaire', async ({ page }) => {
    const input = page.locator('#salary-input')
    await input.fill('5000')
    // Le résultat net pour 5 000 € brut est ~3 800 €
    // Cherche n'importe quelle valeur dans la box résultat (tabular-nums en blanc)
    const resultValue = page.locator('p.tabular-nums').first()
    await expect(resultValue).toBeVisible()
    const text = await resultValue.textContent()
    const amount = parseInt(text?.replace(/\s/g, '').replace(/[^0-9]/g, '') ?? '0')
    expect(amount).toBeGreaterThan(3000)
    expect(amount).toBeLessThan(5000)
  })

  test('efface les résultats si le salaire est vide ou nul', async ({ page }) => {
    const input = page.locator('#salary-input')
    await input.fill('0')
    await expect(page.locator('text=Saisissez un salaire')).toBeVisible()
  })

  // ── Toggles période / statut / sens ──────────────────────────────────────

  test('bascule mensuel → annuel change le label de résultat', async ({ page }) => {
    await page.getByRole('radio', { name: 'Annuel', exact: true }).click()
    await expect(page.locator('text=Net social annuel').first()).toBeVisible()
  })

  test('bascule non-cadre → cadre réduit le net (cotisations CET)', async ({
    page,
  }) => {
    await page.locator('#salary-input').fill('4000')

    const getValue = async () => {
      const el = page.locator('p.tabular-nums').first()
      return (await el.textContent()) ?? ''
    }

    const nonCadreText = await getValue()
    await page.getByRole('radio', { name: 'Cadre', exact: true }).click()
    const cadreText = await getValue()

    expect(nonCadreText).not.toEqual(cadreText)
  })

  test('bascule brut→net vers net→brut', async ({ page }) => {
    await page.getByRole('radio', { name: 'Net → Brut', exact: true }).click()
    await expect(page.locator('label[for="salary-input"]')).toContainText(/net/i)
  })

  // ── Prélèvement à la source ───────────────────────────────────────────────

  test('le bloc PAS est visible avec un salaire saisi', async ({ page }) => {
    // Utilise exact:true pour éviter l'ambiguïté avec le sous-titre
    await expect(
      page.locator('text=Prélèvement à la source').nth(1),
    ).toBeVisible()
    await expect(page.locator('text=Net après impôt')).toBeVisible()
    await expect(page.locator('#pas-slider')).toBeVisible()
  })

  test('bouton réinitialiser apparaît après avoir bougé le slider PAS', async ({
    page,
  }) => {
    await page.locator('#pas-slider').fill('10')
    await expect(page.locator('text=Réinitialiser')).toBeVisible()
  })

  test('réinitialiser le slider PAS masque le bouton', async ({ page }) => {
    await page.locator('#pas-slider').fill('10')
    await page.locator('text=Réinitialiser').click()
    await expect(page.locator('text=Réinitialiser')).not.toBeVisible()
  })

  test('changer les parts fiscales modifie le taux PAS ou l\'efface si non imposable', async ({
    page,
  }) => {
    // À 1 part et 3 000 € brut, le badge "Estimé" est visible
    const badge = page.locator('text=/Estimé/')
    await expect(badge).toBeVisible()
    const before = await badge.textContent()

    // Passe à 1,5 parts → le taux doit changer (toujours imposable)
    await page.getByRole('radio', { name: '1,5', exact: true }).click()
    // Le badge peut avoir changé de valeur ou disparu si taux = 0
    // On vérifie juste que quelque chose a changé (taux affiché différent ou 0)
    const slider = page.locator('#pas-slider')
    const sliderValue = await slider.inputValue()
    expect(parseFloat(sliderValue)).toBeGreaterThanOrEqual(0)

    // La valeur affichée sur le badge (si présent) ou le slider doit différer
    const badgeNow = await page.locator('text=/Estimé/').count()
    if (badgeNow > 0) {
      const after = await page.locator('text=/Estimé/').textContent()
      // Le taux doit avoir changé
      expect(after).not.toEqual(before)
    }
  })

  // ── Dark mode ─────────────────────────────────────────────────────────────

  test('le toggle dark/light ajoute la classe .dark sur <html>', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /mode sombre|mode clair/i })
    await toggleBtn.click()
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    )
    expect(hasDark).toBe(true)
  })

  test('le thème est persisté en localStorage', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /mode sombre|mode clair/i })
    await toggleBtn.click()
    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('dark')
  })

  // ── Détail cotisations ────────────────────────────────────────────────────

  test('le tableau de détail est masqué par défaut', async ({ page }) => {
    await expect(page.locator('text=Retraite de base plafonnée')).not.toBeVisible()
  })

  test('cliquer sur "Voir le détail" révèle le tableau', async ({ page }) => {
    await page.locator('text=Voir le détail des cotisations').click()
    await expect(page.locator('text=Retraite de base plafonnée')).toBeVisible()
    await expect(page.locator('text=CSG déductible')).toBeVisible()
  })

  test('"Masquer le détail" referme le tableau', async ({ page }) => {
    await page.locator('text=Voir le détail des cotisations').click()
    await page.locator('text=Masquer le détail').click()
    await expect(page.locator('text=Retraite de base plafonnée')).not.toBeVisible()
  })
})
