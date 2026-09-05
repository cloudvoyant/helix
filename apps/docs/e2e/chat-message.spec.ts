// apps/docs/e2e/chat-message.spec.ts
// Behavior + accessibility coverage for ChatMessage, matrixed over React and
// Svelte via the docs demo islands: content rendering, meta row, reaction
// toggling with persisting counts, thumbs pressed state, and the emoji menu
// keyboard path.
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
  test.describe(`ChatMessage docs page · ${framework}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('components/chat-message');
      await selectFramework(page, framework);
    });

    test('renders message content in the thread', async ({ page }) => {
      await expect(island(page, framework).getByText('Morning! Standup in ten?').first()).toBeVisible();
    });

    test('renders the meta row with sender and time', async ({ page }) => {
      const target = demo(page, framework, 'Morning! Standup in ten?');
      await expect(target.getByText('Sam')).toBeVisible();
      await expect(target.locator('time').first()).toBeVisible();
    });

    test('renders all three message variants', async ({ page }) => {
      const target = island(page, framework).filter({ hasText: "other people's messages" }).first();
      await expect(target.getByText('Agent — AI assistant replies.')).toBeVisible();
      await expect(target.getByText('User — your own messages.')).toBeVisible();
    });

    test('toggling a reaction updates and persists its count', async ({ page }) => {
      const target = demo(page, framework, 'Click a reaction');
      const pill = target.locator('button[aria-label="React 👍"]');
      await expect(pill).toContainText('2');
      await pill.click();
      await expect(pill).toContainText('3');
      await expect(pill).toHaveAttribute('aria-pressed', 'true');
    });

    test('ReactionRate thumbs toggle pressed state', async ({ page }) => {
      const target = demo(page, framework, 'Pick a reaction');
      const up = target.getByRole('button', { name: 'Thumbs up' });
      await expect(up).toHaveAttribute('aria-pressed', 'false');
      await up.click();
      await expect(up).toHaveAttribute('aria-pressed', 'true');
    });

    test('emoji menu opens from keyboard and adds a reaction', async ({ page }) => {
      const target = demo(page, framework, 'Pick a reaction');
      const trigger = target.getByRole('button', { name: 'Add reaction' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const heart = page.getByRole('button', { name: 'React ❤️' });
      await expect(heart).toBeVisible();
      await heart.click();
      await expect(target.locator('button[aria-label="React ❤️"][aria-pressed="true"]')).toBeAttached();
    });

    test('emoji menu closes with Escape and returns focus to the trigger', async ({ page }) => {
      const target = demo(page, framework, 'Pick a reaction');
      const trigger = target.getByRole('button', { name: 'Add reaction' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    });
  });
}
