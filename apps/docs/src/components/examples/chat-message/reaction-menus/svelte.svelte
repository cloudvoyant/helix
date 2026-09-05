<!-- apps/docs/src/components/examples/chat-message/reaction-menus/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-svelte';
  import type { ChatReactions } from '@cloudvoyant/vortex-ui';

  let reactions = $state<ChatReactions>({});
  let mine = $state<string[]>([]);

  function toggle(icon: string) {
    const active = mine.includes(icon);
    reactions = { ...reactions, [icon]: Math.max(0, (reactions[icon] ?? 0) + (active ? -1 : 1)) };
    mine = active ? mine.filter((i) => i !== icon) : [...mine, icon];
  }
</script>

<Chat class="h-64">
  <ChatThread>
    <ChatMessage from="Sam" {reactions} activeReactions={mine} onReactionToggle={toggle}>
      Pick a reaction from the menus below.
    </ChatMessage>
  </ChatThread>
</Chat>
