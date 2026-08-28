import { test, expect } from '@playwright/test'

test.describe('App Navigation Flow', () => {
  test('navigates seamlessly across landing page and auth views', async ({ page }) => {
    // Navigate to root (Landing Page)
    await page.goto('/')

    // Landing Page title check
    await expect(page).toHaveTitle(/Studdy AI/i)

    // Check Hero text
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Navigate to Sign In page
    await page.goto('/sign-in')
    await expect(page).toHaveURL(/.*sign-in/)
    await expect(page.getByText(/Welcome back to smarter studying/i)).toBeVisible()

    // Navigate to Sign Up page
    await page.goto('/sign-up')
    await expect(page).toHaveURL(/.*sign-up/)
    await expect(page.getByText(/Build a better study routine/i)).toBeVisible()
  })
})
