// apps/docs/src/components/examples/chat/sending/react.tsx
import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-react';

export default function ReactChatSending() {
  return (
    <Chat className="h-64">
      <ChatThread>
        <ChatMessage from="Sam" at={new Date('2026-09-05T09:30:00')}>
          Ping me when the build is green.
        </ChatMessage>
        <ChatMessage variant="user" status="sending" at={new Date('2026-09-05T09:31:00')}>
          Sending now…
        </ChatMessage>
      </ChatThread>
    </Chat>
  );
}
