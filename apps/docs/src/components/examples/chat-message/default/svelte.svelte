<!-- apps/docs/src/components/examples/chat-message/default/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-svelte';
</script>

<Chat class="h-64">
  <ChatThread>
    <ChatMessage from="Sam" at={new Date('2026-09-05T09:30:00')}>
      Morning! Standup in ten?
    </ChatMessage>
    <ChatMessage variant="user" from="You" at={new Date('2026-09-05T09:31:00')}>
      On my way ☕
    </ChatMessage>
  </ChatThread>
</Chat>
