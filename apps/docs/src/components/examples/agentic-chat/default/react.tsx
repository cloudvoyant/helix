import { AgenticChat, AgentStreamingMessage, ChatInput, useAgenticChat } from '@cloudvoyant/vortex-react';
import type { ChatSendPayload } from '@cloudvoyant/vortex-ui';
import { useState } from 'react';

const history = Array.from({ length: 80 }, (_, index) => ({
  id: `history-${index}`,
  role: index % 2 ? ('user' as const) : ('agent' as const),
  from: index % 2 ? 'You' : 'Agent',
  content:
    index === 0
      ? '**Virtualized Markdown** stays safe. <img src=x onerror=alert(1)> [unsafe](javascript:alert(1))'
      : `History message ${index + 1}`,
  status: 'completed' as const,
}));
const lines = [
  'Lorem ipsum dolor sit amet.',
  'Consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt.',
  'Ut labore et dolore magna aliqua.',
];

export default function ReactAgenticChatDefault() {
  const chat = useAgenticChat({ initialMessages: history });
  const [historyLoads, setHistoryLoads] = useState(0);

  function loadHistory() {
    setHistoryLoads((value) => value + 1);
    chat.prependMessages([
      {
        id: `older-${historyLoads}`,
        role: 'agent',
        from: 'Agent',
        content: `Older history batch ${historyLoads + 1}`,
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

  return (
    <AgenticChat
      messages={chat.messages}
      className="h-[32rem]"
      followOutput={false}
      data-history-loads={historyLoads}
      onScrollTop={loadHistory}
    >
      <div aria-label="State controls">
        <button type="button" onClick={() => chat.updateMessage('history-79', { content: 'Updated message' })}>
          Update message
        </button>
        <button type="button" onClick={() => chat.removeMessage('history-0')}>
          Remove message
        </button>
        <button type="button" onClick={() => chat.setStreaming('Retrying response', 'retrying')}>
          Retry stream
        </button>
        <button type="button" onClick={chat.cancelStreaming}>
          Cancel stream
        </button>
        <button type="button" onClick={chat.clearMessages}>
          Clear messages
        </button>
      </div>
      <AgentStreamingMessage content={chat.streamingContent} state={chat.streamingState} />
      <ChatInput onSend={send} />
    </AgenticChat>
  );
}
