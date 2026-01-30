# Playwright E2E Testing Setup

This document contains everything needed to restore Playwright E2E testing to the Omnis project.

## Installation

```bash
npm install -D @playwright/test playwright
npx playwright install chromium
```

To install all browsers (optional):
```bash
npx playwright install
```

## package.json Scripts

Add these scripts to the `"scripts"` section:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

## playwright.config.ts

Create this file in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## E2E Test Structure

Create directory: `test/e2e/`

### Example E2E Tests

#### `test/e2e/tags.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Tag Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('creates and displays a new tag', async ({ page }) => {
    await page.click('[data-testid="add-tag-button"]')
    await page.fill('[name="tag-name"]', 'work')
    await page.click('[data-testid="save-tag"]')

    await expect(page.locator('text=work')).toBeVisible()
  })

  test('reorders tags via drag and drop', async ({ page }) => {
    const tags = page.locator('[data-testid="tag-item"]')
    await tags.nth(0).dragTo(tags.nth(1))

    await expect(tags.nth(0)).toContainText('work')
  })

  test('deletes a tag', async ({ page }) => {
    const tags = page.locator('[data-testid="tag-item"]')
    const initialCount = await tags.count()

    await tags.nth(0).click()
    await page.click('[data-testid="delete-tag"]')
    await page.click('button:has-text("Delete")')

    await expect(tags).toHaveCount(initialCount - 1)
  })
})
```

#### `test/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('redirects authenticated user to home', async ({ page }) => {
    // First, login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')

    // Now try to go to login again
    await page.goto('/login')
    await expect(page).toHaveURL('/')
  })
})
```

#### `test/e2e/items.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Item Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('creates a new note item', async ({ page }) => {
    await page.click('[data-testid="add-item-button"]')
    await page.click('[data-testid="item-type-note"]')

    const editor = page.locator('[contenteditable="true"]')
    await editor.fill('This is a test note')

    await page.click('button:has-text("Save")')

    await expect(page.locator('text=This is a test note')).toBeVisible()
  })

  test('filters items by status', async ({ page }) => {
    await page.click('[data-testid="status-filter-inbox"]')
    await expect(page.locator('[data-testid="item-card"]').first()).toBeVisible()

    await page.click('[data-testid="status-filter-done"]')
    // Assert done items are shown
  })

  test('adds a tag to an item', async ({ page }) => {
    const itemCard = page.locator('[data-testid="item-card"]').first()
    await itemCard.click()

    await page.click('[data-testid="add-tag-to-item"]')
    await page.click('[data-testid="tag-option-work"]')

    await expect(itemCard.locator('[data-testid="item-tag-work"]')).toBeVisible()
  })
})
```

## Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run specific test file
npx playwright test test/e2e/tags.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## Test Data Requirements

E2E tests need a test database or Supabase project with:
- Test user: `test@example.com` / `password123`
- Sample data for testing various scenarios

Consider using a separate Supabase project for E2E testing to avoid polluting development data.

## Uninstalling Playwright

If you need to remove Playwright again:

```bash
npx playwright uninstall --all
npm uninstall @playwright/test playwright
rm playwright.config.ts
rm -rf test/e2e
```

Then remove the E2E scripts from package.json.

## Testing Agent Update

After installing Playwright, restore the E2E section in `.claude/agents/claude generated/testing-specialist.md` by adding this content after the "Component Testing Patterns" section:

```markdown
## E2E Testing with Playwright

**Critical Workflows:**
```typescript
// test/e2e/tags.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Tag Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('creates and displays a new tag', async ({ page }) => {
    await page.click('[data-testid="add-tag-button"]')
    await page.fill('[name="tag-name"]', 'work')
    await page.click('[data-testid="save-tag"]')

    await expect(page.locator('text=work')).toBeVisible()
  })

  test('reorders tags via drag and drop', async ({ page }) => {
    const tags = page.locator('[data-testid="tag-item"]')
    await tags.nth(0).dragTo(tags.nth(1))

    await expect(tags.nth(0)).toContainText('work')
  })
})
```
```

Also update the commands section to include:
```
npm run test:e2e       # Run Playwright E2E tests
```

And update the /test skill (`.claude/skills/test.md`) to include:
```
- Writing E2E tests with Playwright
```
