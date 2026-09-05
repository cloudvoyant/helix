import { expect, test } from '@playwright/test';
import { selectFramework } from './helpers';

const FRAMEWORKS = ['react', 'svelte'] as const;

for (const framework of FRAMEWORKS) {
  test.describe(`Chat family · ${framework}`, () => {
    test('renders roles, safe Markdown, attachments, and keyboard reactions', async ({ page }) => {
      await page.goto('components/chat-message');
      await selectFramework(page, framework);
      const demo = page.locator(`[data-demo] [data-fw="${framework}"]`).first();
      await expect(demo.locator('[data-role="default"]')).toContainText('Regular message');
      await expect(demo.locator('[data-role="user"]')).toHaveAttribute('data-status', 'sending');
      await expect(demo.getByText('Agent message', { exact: true })).toBeVisible();
      await expect(demo.getByLabel('Attachments')).toContainText('report.md');
      const reaction = demo.getByRole('button', { name: 'Helpful', exact: true });
      await reaction.focus();
      await page.keyboard.press('Space');
      await expect(reaction).toHaveAttribute('aria-pressed', 'true');
      await expect(reaction).toContainText('5');
      await expect(reaction.locator('svg')).toBeVisible();
    });

    test('submits text and attachments and clears typing state', async ({ page }) => {
      await page.goto('components/chat');
      await selectFramework(page, framework);
      const demo = page.locator(`[data-demo] [data-fw="${framework}"]`).first();
      await expect(demo.getByRole('status')).toContainText('Avery is typing');
      await expect(demo.getByRole('button', { name: 'Attach files' }).locator('svg')).toBeVisible();
      const textbox = demo.getByRole('textbox');
      await textbox.fill('First line');
      await textbox.press('Shift+Enter');
      await expect(textbox).toHaveValue('First line\n');
      await textbox.dispatchEvent('compositionstart');
      await textbox.press('Enter');
      await expect(textbox).toHaveValue('First line\n\n');
      await expect(demo.locator('[data-chat-message]').filter({ hasText: 'First line' })).toHaveCount(0);
      await textbox.dispatchEvent('compositionend');
      await textbox.fill('');
      await demo
        .locator('input[type="file"]')
        .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
      await expect(demo.getByLabel('Selected attachments')).toContainText('notes.txt');
      await expect(demo.locator('[data-custom-remove-icon]')).toBeVisible();
      await demo.getByRole('button', { name: 'Remove notes.txt' }).click();
      await expect(demo.getByLabel('Selected attachments')).toHaveCount(0);
      await demo
        .locator('input[type="file"]')
        .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
      await demo.getByRole('button', { name: 'Disable input' }).click();
      await expect(textbox).toBeDisabled();
      await expect(demo.getByRole('button', { name: 'Attach files' })).toBeDisabled();
      await demo.getByRole('button', { name: 'Enable input' }).click();
      await textbox.fill('Hello from Playwright');
      await textbox.press('Enter');
      await expect(demo.locator('[data-role="user"]').filter({ hasText: 'Hello from Playwright' }).last()).toBeVisible();
      await expect(demo.getByText('notes.txt', { exact: true }).last()).toBeVisible();
      await expect(demo.getByText('Avery is typing')).toHaveCount(0);
      await expect(demo.getByRole('button', { name: 'Send message' })).toBeDisabled();
      await expect(demo.locator('[data-status="completed"]').last()).toContainText('Hello from Playwright');
    });

    test('virtualizes history and commits deterministic streaming output', async ({ page }) => {
      await page.goto('components/agentic-chat');
      await selectFramework(page, framework);
      const demo = page.locator(`[data-demo] [data-fw="${framework}"]`).first();
      const rows = demo.locator('[data-agentic-thread] [data-index]');
      await expect(rows.first()).toBeVisible();
      expect(await rows.count()).toBeLessThan(80);
      await expect(demo.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
      await expect(demo.locator('img')).toHaveCount(0);
      expect(await demo.getByRole('link', { name: 'unsafe' }).getAttribute('href')).toBe('');
      const thread = demo.locator('[data-agentic-thread]');
      await thread.evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
      await thread.evaluate((node) => node.scrollTo({ top: 0 }));
      await expect(demo.locator('[data-history-loads="1"]')).toBeVisible();
      await expect(demo.getByText('Older history batch 1')).toBeVisible();
      await thread.evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
      await thread.evaluate((node) => node.scrollTo({ top: 0 }));
      await expect(demo.locator('[data-history-loads="2"]')).toBeVisible();
      await expect(demo.getByText('Older history batch 2')).toBeVisible();
      await demo.getByRole('textbox').fill('Stream a response');
      await demo.getByRole('textbox').press('Enter');
      await expect(demo.locator('[data-agent-streaming="streaming"]')).toBeVisible();
      await expect(demo.locator('[data-agent-streaming="streaming"]')).toContainText('Lorem ipsum dolor sit amet.');
      await expect(demo.locator('[data-agent-streaming="completed"]')).toContainText('Ut labore et dolore magna aliqua.', {
        timeout: 5_000,
      });
      await expect(demo.locator('[data-agent-streaming="streaming"]')).toHaveCount(0);
    });

    test('applies every agentic state mutation and status transition', async ({ page }) => {
      await page.goto('components/agentic-chat');
      await selectFramework(page, framework);
      const demo = page.locator(`[data-demo] [data-fw="${framework}"]`).first();
      const thread = demo.locator('[data-agentic-thread]');
      await demo.getByRole('button', { name: 'Update message' }).click();
      await thread.evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
      await expect(demo.getByText('Updated message')).toBeVisible();
      await demo.getByRole('button', { name: 'Remove message' }).click();
      await thread.evaluate((node) => node.scrollTo({ top: 0 }));
      await expect(demo.getByText('Virtualized Markdown')).toHaveCount(0);
      await demo.getByRole('button', { name: 'Retry stream' }).click();
      await expect(demo.locator('[data-agent-streaming="retrying"]')).toContainText('Retrying response');
      await expect(demo.locator('[data-agent-streaming="retrying"] svg')).toBeVisible();
      await demo.getByRole('button', { name: 'Cancel stream' }).click();
      await expect(demo.locator('[data-agent-streaming="cancelled"]')).toBeVisible();
      await demo.getByRole('button', { name: 'Clear messages' }).click();
      await expect(demo.locator('[data-agentic-thread] [data-index]')).toHaveCount(0);
    });
  });
}
