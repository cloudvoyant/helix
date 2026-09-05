<!-- apps/docs/src/components/examples/chat/sending/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-svelte';
</script>

<Chat class="h-64">
  <ChatThread>
    <ChatMessage from="Sam" at={new Date('2026-09-05T09:30:00')}>
      Ping me when the build is green.
    </ChatMessage>
    <ChatMessage variant="user" status="sending" at={new Date('2026-09-05T09:31:00')}>
      Sending now…
    </ChatMessage>
  </ChatThread>
</Chat>
