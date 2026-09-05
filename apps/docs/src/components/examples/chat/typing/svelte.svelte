<!-- apps/docs/src/components/examples/chat/typing/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatMessage, ChatThread, TypingIndicator } from '@cloudvoyant/vortex-svelte';
</script>

<Chat class="h-64">
  <ChatThread>
    <ChatMessage variant="user" from="You">
      Anyone around?
    </ChatMessage>
    <TypingIndicator />
  </ChatThread>
</Chat>
