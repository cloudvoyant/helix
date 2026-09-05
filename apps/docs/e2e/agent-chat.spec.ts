// apps/docs/e2e/agent-chat.spec.ts
// Streaming coverage for AgentChat, matrixed over React and Svelte: send →
// typing indicator → streamed text → settled agent message, with the live
// region unmounting after the reply completes.
import { selectFramework } from './helpers';
import { test, expect, type Locator, type Page } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;
type Framework = (typeof FRAMEWORKS)[number];

function island(page: Page, framework: Framework): Locator {
  return page.locator(`[data-demo] [data-fw="${framework}"]`);
}

for (const framework of FRAMEWORKS) {
  test.describe(`AgentChat docs page · ${framework}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('components/agent-chat');
      await selectFramework(page, framework);
    });

    test('streams a reply that settles as an agent message', async ({ page }) => {
      const target = island(page, framework)
        .filter({ has: page.getByRole('textbox', { name: 'Write a message…' }) })
        .first();
      const box = target.getByRole('textbox');
      await box.fill('give me lorem');
      await box.press('Enter');

      const live = target.locator('[aria-live="polite"]');
      await expect(live).toBeVisible();
      await expect(target.getByText(/ipsum/i).first()).toBeVisible({ timeout: 15_000 });

      await expect(live).toHaveCount(0);
      await expect(target.getByText(/ipsum/i).first()).toBeVisible();
      await expect(target.getByText('give me lorem').first()).toBeVisible();
    });

    test('the user message renders immediately on send', async ({ page }) => {
      const target = island(page, framework)
        .filter({ has: page.getByRole('textbox', { name: 'Write a message…' }) })
        .first();
      const box = target.getByRole('textbox');
      await box.fill('ping');
      await box.press('Enter');
      await expect(target.getByText('ping').first()).toBeVisible();
    });
  });
}
