<script lang="ts">
  import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-svelte';

  const attachments = [{ id: 'report', name: 'report.md', type: 'text/markdown', size: 128 }];
  const reactions = [
    { key: 'celebrate', label: 'Celebrate', value: '🎉', count: 2, variant: 'emoji' as const },
    {
      key: 'helpful',
      label: 'Helpful',
      value: '👍',
      count: 4,
      variant: 'rate' as const,
      icon: 'thumbs-up' as const,
    },
    {
      key: 'not-helpful',
      label: 'Not helpful',
      value: '👎',
      count: 0,
      variant: 'rate' as const,
      icon: 'thumbs-down' as const,
    },
  ];
</script>

<Chat variant="ios" class="h-[28rem]">
  <ChatThread>
    <ChatMessage id="regular" role="default" from="Avery" at="2026-09-05T10:00:00Z" content="Regular message" />
    <ChatMessage
      id="user"
      role="user"
      from="You"
      at="2026-09-05T10:01:00Z"
      status="sending"
      content="Message from the current user"
    />
    <ChatMessage
      id="agent"
      role="agent"
      from="Agent"
      at="2026-09-05T10:02:00Z"
      content={'**Agent message** with `rich Markdown`.'}
      {attachments}
      {reactions}
    />
  </ChatThread>
</Chat>
