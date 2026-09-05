// apps/docs/src/components/examples/chat/typing/react.tsx
import { Chat, ChatMessage, ChatThread, TypingIndicator } from '@cloudvoyant/vortex-react';

export default function ReactChatTyping() {
  return (
    <Chat className="h-64">
      <ChatThread>
        <ChatMessage variant="user" from="You">
          Anyone around?
        </ChatMessage>
        <TypingIndicator />
      </ChatThread>
    </Chat>
  );
}
