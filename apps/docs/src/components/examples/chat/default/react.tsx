// apps/docs/src/components/examples/chat/default/react.tsx
import { useState } from 'react';
import { Chat, ChatInput, ChatThread } from '@cloudvoyant/vortex-react';
import type { ChatMessageData } from '@cloudvoyant/vortex-ui';

export default function ReactChatDefault() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    { id: 'm1', variant: 'default', content: 'Hey there! Type below to reply.', from: 'Sam' },
  ]);

  const handleSend = (text: string) => {
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), variant: 'user', content: text },
      { id: crypto.randomUUID(), variant: 'default', content: `You said: ${text}`, from: 'Echo' },
    ]);
  };

  return (
    <Chat className="h-72">
      <ChatThread messages={messages} />
      <ChatInput onSend={handleSend} />
    </Chat>
  );
}
