// apps/docs/e2e/chat.spec.ts
// Behavior + accessibility coverage for the Chat surface, matrixed over React
// and Svelte: composer Enter-to-send with Shift+Enter newline, echo round
// trip, sending status styling, and the typing indicator announcement.
import { selectFramework } from './helpers';
import { test, expect, type Locator, type Page } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;
type Framework = (typeof FRAMEWORKS)[number];

function island(page: Page, framework: Framework): Locator {
  return page.locator(`[data-demo] [data-fw="${framework}"]`);
}

function demo(page: Page, framework: Framework, text: string): Locator {
  return island(page, framework).filter({ hasText: text }).first();
}

for (const framework of FRAMEWORKS) {
  test.describe(`Chat docs page · ${framework}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('components/chat');
      await selectFramework(page, framework);
    });

    test('sends on Enter and clears the composer', async ({ page }) => {
      const target = demo(page, framework, 'Type below to reply');
      const box = target.getByRole('textbox');
      await box.fill('hello chat');
      await box.press('Enter');
      await expect(box).toHaveValue('');
      await expect(target.getByText('You said: hello chat')).toBeVisible();
    });

    test('Shift+Enter inserts a newline instead of sending', async ({ page }) => {
      const target = demo(page, framework, 'Type below to reply');
      const box = target.getByRole('textbox');
      await box.fill('line one');
      await box.press('Shift+Enter');
      await expect(box).toHaveValue('line one\n');
      await box.press('Enter');
      await expect(target.getByText('You said: line one')).toBeVisible();
    });

    test('ios variant floats the user message to the right', async ({ page }) => {
      const target = island(page, framework).filter({ hasText: 'Lunch at the usual place?' }).first();
      const userRow = target.locator('.justify-end').first();
      await expect(userRow.getByText('Sounds good — see you at noon!')).toBeVisible();
    });

    test('sending status dims the message', async ({ page }) => {
      const target = island(page, framework).filter({ hasText: 'Sending now…' }).first();
      await expect(target.locator('.opacity-60', { hasText: 'Sending now…' })).toBeVisible();
    });

    test('typing indicator announces its status', async ({ page }) => {
      const target = island(page, framework).filter({ hasText: 'Anyone around?' }).first();
      const status = target.getByRole('status').first();
      await expect(status).toBeVisible();
      await expect(status).toContainText('typing…');
    });
  });
}
