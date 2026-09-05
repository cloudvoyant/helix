<script lang="ts">
  import { AgenticChat, AgentStreamingMessage, ChatInput, createAgenticChat } from '@cloudvoyant/vortex-svelte';
  import type { ChatMessageData, ChatSendPayload } from '@cloudvoyant/vortex-ui';

  const history: ChatMessageData[] = Array.from({ length: 80 }, (_, index) => ({
    id: `history-${index}`,
    role: index % 2 ? 'user' : 'agent',
    from: index % 2 ? 'You' : 'Agent',
    content:
      index === 0
        ? '**Virtualized Markdown** stays safe. <img src=x onerror=alert(1)> [unsafe](javascript:alert(1))'
        : `History message ${index + 1}`,
    status: 'completed',
  }));
  const lines = [
    'Lorem ipsum dolor sit amet.',
    'Consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt.',
    'Ut labore et dolore magna aliqua.',
  ];
  const chat = createAgenticChat({ initialMessages: history });
  let historyLoads = $state(0);

  function loadHistory() {
    historyLoads += 1;
    chat.prependMessages([
      {
        id: `older-${historyLoads}`,
        role: 'agent',
        from: 'Agent',
        content: `Older history batch ${historyLoads}`,
        status: 'completed',
      },
    ]);
  }

  async function send({ text }: ChatSendPayload) {
    chat.addMessage({ id: crypto.randomUUID(), role: 'user', from: 'You', content: text, status: 'completed' });
    chat.setStreaming('', 'waiting');
    let content = '';
    for (const line of lines) {
      await new Promise((resolve) => window.setTimeout(resolve, 120));
      content = `${content}${content ? '\n\n' : ''}${line}`;
      chat.setStreaming(content, 'streaming');
    }
    chat.addMessage({ id: crypto.randomUUID(), role: 'agent', from: 'Agent', content, status: 'completed' });
    chat.setStreaming(content, 'completed');
  }
</script>

<AgenticChat
  messages={chat.messages}
  class="h-[32rem]"
  followOutput={false}
  data-history-loads={historyLoads}
  onScrollTop={loadHistory}
>
  <div aria-label="State controls">
    <button type="button" onclick={() => chat.updateMessage('history-79', { content: 'Updated message' })}
      >Update message</button
    >
    <button type="button" onclick={() => chat.removeMessage('history-0')}>Remove message</button>
    <button type="button" onclick={() => chat.setStreaming('Retrying response', 'retrying')}>Retry stream</button>
    <button type="button" onclick={chat.cancelStreaming}>Cancel stream</button>
    <button type="button" onclick={chat.clearMessages}>Clear messages</button>
  </div>
  <AgentStreamingMessage content={chat.streamingContent} state={chat.streamingState} />
  <ChatInput onSend={send} />
</AgenticChat>
