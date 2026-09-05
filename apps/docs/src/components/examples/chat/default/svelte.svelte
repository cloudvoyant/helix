<!-- apps/docs/src/components/examples/chat/default/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatInput, ChatThread } from '@cloudvoyant/vortex-svelte';
  import type { ChatMessageData } from '@cloudvoyant/vortex-ui';

  let messages = $state<ChatMessageData[]>([
    { id: 'm1', variant: 'default', content: 'Hey there! Type below to reply.', from: 'Sam' },
  ]);

  function handleSend(text: string) {
    messages = [
      ...messages,
      { id: crypto.randomUUID(), variant: 'user', content: text },
      { id: crypto.randomUUID(), variant: 'default', content: `You said: ${text}`, from: 'Echo' },
    ];
  }
</script>

<Chat class="h-72">
  <ChatThread {messages} />
  <ChatInput onSend={handleSend} />
</Chat>
