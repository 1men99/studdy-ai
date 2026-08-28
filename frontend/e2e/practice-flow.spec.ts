import { test, expect } from '@playwright/test'

test.describe('Practice Questions End-to-End Flow', () => {
  test('validates input length, mocks question generation, and tests question answering', async ({ page }) => {
    // Enable test session bypass
    await page.addInitScript(() => {
      window.sessionStorage.setItem('playwright_test_user', 'true')
    })

    // Intercept backend questions generation API
    await page.route('**/api/v1/questions/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questions: [
            {
              id: '1',
              type: 'multiple_choice',
              question: 'Where does glycolysis occur in the cell?',
              options: ['Cytoplasm', 'Mitochondria', 'Nucleus', 'Ribosome'],
              answer: 'Cytoplasm',
              explanation: 'Glycolysis occurs in the cytoplasm of the cell.',
            },
            {
              id: '2',
              type: 'true_false',
              question: 'Oxygen is required for glycolysis.',
              options: [],
              answer: 'False',
              explanation: 'Glycolysis is an anaerobic process.',
            },
          ],
        }),
      })
    })

    // Navigate to Practice page
    await page.goto('/practice')

    // Expect header
    await expect(page.getByText('Practice Generator')).toBeVisible()

    // Test text input
    const textarea = page.locator('textarea#notes-input')
    await expect(textarea).toBeVisible()

    // Enter short text (< 50 chars)
    await textarea.fill('Short note')
    await expect(page.getByText(/50 characters/i)).toBeVisible()

    // Enter valid notes (> 50 chars)
    await textarea.fill(
      'Cellular respiration converts glucose into ATP. Glycolysis occurs in the cytoplasm and is anaerobic. The Krebs cycle occurs in the mitochondria.'
    )

    // Click Generate button
    const generateBtn = page.getByRole('button', { name: /generate/i })
    await expect(generateBtn).toBeEnabled()
    await generateBtn.click()

    // Expect generated questions to appear
    await expect(page.getByText('Where does glycolysis occur in the cell?')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Cytoplasm')).toBeVisible()

    // Answer the multiple choice question
    await page.getByText('Cytoplasm').click()
    await expect(page.getByText(/Correct!/i)).toBeVisible()
    await expect(page.getByText(/Glycolysis occurs in the cytoplasm/i)).toBeVisible()
  })
})
