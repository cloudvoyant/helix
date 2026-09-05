import { describe, expect, it } from 'vitest';
import { formatChatTimestamp, renderChatMarkdown } from '@cloudvoyant/vortex-ui';

describe('chat helpers', () => {
  it('renders CommonMark while escaping raw HTML', () => {
    const html = renderChatMarkdown('**Hello** <script>alert(1)</script>');
    expect(html).toContain('<strong>Hello</strong>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('removes dangerous link protocols', () => {
    const html = renderChatMarkdown('[open](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });

  it('returns the original value for an invalid timestamp', () => {
    expect(formatChatTimestamp('pending')).toBe('pending');
  });
});
