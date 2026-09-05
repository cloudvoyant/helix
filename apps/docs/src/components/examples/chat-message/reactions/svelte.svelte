<!-- apps/docs/src/components/examples/chat-message/reactions/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-svelte';
  import type { ChatReactions } from '@cloudvoyant/vortex-ui';

  let reactions = $state<ChatReactions>({ '👍': 2, '🎉': 1 });
  let mine = $state<string[]>([]);

  function toggle(icon: string) {
    const active = mine.includes(icon);
    reactions = { ...reactions, [icon]: Math.max(0, (reactions[icon] ?? 0) + (active ? -1 : 1)) };
    mine = active ? mine.filter((i) => i !== icon) : [...mine, icon];
  }
</script>

<Chat class="h-64">
  <ChatThread>
    <ChatMessage
      from="Sam"
      at={new Date('2026-09-05T09:40:00')}
      {reactions}
      activeReactions={mine}
      onReactionToggle={toggle}
    >
      Click a reaction — the count sticks.
    </ChatMessage>
  </ChatThread>
</Chat>
