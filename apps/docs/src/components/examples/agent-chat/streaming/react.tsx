// apps/docs/src/components/examples/agent-chat/streaming/react.tsx
import { useEffect, useRef } from 'react';
import { AgentChat, AgentStreamingMessage, ChatInput, ChatThread, useAgenticChat } from '@cloudvoyant/vortex-react';

const LOREM_LINES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Nisi ut aliquip ex ea commodo consequat duis aute irure dolor.',
  'In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
];

export default function ReactAgentChatStreaming() {
  const chat = useAgenticChat();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const handleSend = (text: string) => {
    chat.addMessage({ id: crypto.randomUUID(), variant: 'user', content: text });
    chat.dispatch({ type: 'start' });
    const words = LOREM_LINES.join(' ').split(' ');
    let index = 0;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      index += 2;
      chat.setStreamingText(words.slice(0, index).join(' '));
      if (index >= words.length) {
        if (timer.current) clearInterval(timer.current);
        chat.dispatch({ type: 'done', id: crypto.randomUUID() });
      }
    }, 120);
  };

  const loadHistory = () => {
    chat.prependMessages([
      { id: crypto.randomUUID(), variant: 'default', content: '— earlier history —', from: 'Sam' },
    ]);
  };

  return (
    <AgentChat chat={chat} className="h-72">
      <ChatThread variant="minimal" messages={chat.state.messages} virtual onScrollTop={loadHistory} />
      <AgentStreamingMessage />
      <ChatInput onSend={handleSend} />
    </AgentChat>
  );
}
