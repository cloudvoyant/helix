<script lang="ts">
  import { Chat, ChatInput, ChatMessage, ChatThread, ChatTypingIndicator } from '@cloudvoyant/vortex-svelte';
  import type { ChatMessageData, ChatSendPayload } from '@cloudvoyant/vortex-ui';

  let messages = $state<ChatMessageData[]>([
    {
      id: 'hello',
      role: 'default',
      from: 'Avery',
      content: 'Try sending a message or attaching a file.',
      status: 'completed',
    },
  ]);
  let typing = $state(true);
  let disabled = $state(false);

  async function send({ text, attachments }: ChatSendPayload) {
    const id = `demo-${messages.length}`;
    messages = [
      ...messages,
      { id, role: 'user', from: 'You', content: text || 'Attachment', attachments, status: 'sending' },
    ];
    typing = false;
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    messages = messages.map((message) => (message.id === id ? { ...message, status: 'completed' } : message));
  }
</script>

{#snippet removeIcon()}<span data-custom-remove-icon aria-hidden="true">Remove</span>{/snippet}

<Chat variant="slack" class="h-[30rem]">
  <ChatThread>
    {#each messages as message (message.id)}<ChatMessage {...message} />{/each}
    {#if typing}<ChatTypingIndicator label="Avery is typing" />{/if}
  </ChatThread>
  <button
    type="button"
    onclick={() => {
      disabled = !disabled;
    }}>{disabled ? 'Enable input' : 'Disable input'}</button
  >
  <ChatInput {disabled} {removeIcon} onSend={send} />
</Chat>
