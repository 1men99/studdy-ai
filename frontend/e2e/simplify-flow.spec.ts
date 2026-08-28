import { test, expect } from '@playwright/test'

test.describe('Plain-Language Translator End-to-End Flow', () => {
  test('simplifies difficult text and displays side-by-side comparison with watch-out warnings', async ({ page }) => {
    // Enable test session bypass
    await page.addInitScript(() => {
      window.sessionStorage.setItem('playwright_test_user', 'true')
    })

    // Intercept backend simplification API
    await page.route('**/api/v1/simplify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plain_language:
            'This apartment lease agreement requires rent to be paid on the 1st of every month. If you pay late after the 5th, you will be charged a $50 late fee.',
          watch_out_for: [
            {
              category: 'Fees',
              title: 'Late Fee Penalty',
              description: '$50 fee assessed if rent is received after the 5th of the month.',
              severity: 'alert',
            },
            {
              category: 'Deadlines',
              title: '30-Day Move-out Notice',
              description: 'Must provide 30 days written notice before vacating.',
              severity: 'warning',
            },
          ],
        }),
      })
    })

    await page.goto('/simplify')

    // Expect page title
    await expect(page.getByText('Simplify Complex Text')).toBeVisible()

    // Select Contract classification button
    await page.getByRole('button', { name: 'Contract' }).click()

    // Enter contract clause
    const textarea = page.locator('textarea#text-input')
    const leaseClause =
      'The Lessee shall remit monthly rental payments on or before the first calendar day. Payments postmarked after the fifth day incur an immediate $50.00 liquidated damages assessment.'
    await textarea.fill(leaseClause)

    // Click Simplify button
    const simplifyBtn = page.getByRole('button', { name: /simplify text/i })
    await expect(simplifyBtn).toBeEnabled()
    await simplifyBtn.click()

    // Expect side-by-side panels
    await expect(page.getByText('Original Text')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/This apartment lease agreement requires rent/i)).toBeVisible()

    // Expect Watch-Out cards
    await expect(page.getByText('Late Fee Penalty')).toBeVisible()
    await expect(page.getByText('$50 fee assessed if rent is received after the 5th')).toBeVisible()
    await expect(page.getByText('30-Day Move-out Notice')).toBeVisible()
  })
})
