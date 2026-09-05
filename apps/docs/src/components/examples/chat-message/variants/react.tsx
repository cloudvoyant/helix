// apps/docs/src/components/examples/chat-message/variants/react.tsx
import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-react';

export default function ReactChatMessageVariants() {
  return (
    <Chat className="h-64">
      <ChatThread>
        <ChatMessage from="Priya" at={new Date('2026-09-05T10:02:00')}>
          Default — other people's messages.
        </ChatMessage>
        <ChatMessage variant="agent" from="Agent" at={new Date('2026-09-05T10:02:30')}>
          Agent — AI assistant replies.
        </ChatMessage>
        <ChatMessage variant="user" from="You" at={new Date('2026-09-05T10:03:00')}>
          User — your own messages.
        </ChatMessage>
      </ChatThread>
    </Chat>
  );
}
