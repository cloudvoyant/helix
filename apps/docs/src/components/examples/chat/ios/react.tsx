// apps/docs/src/components/examples/chat/ios/react.tsx
import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-react';

export default function ReactChatIos() {
  return (
    <Chat variant="ios" className="h-72">
      <ChatThread>
        <ChatMessage from="Dana" at={new Date('2026-09-05T11:15:00')}>
          Lunch at the usual place?
        </ChatMessage>
        <ChatMessage variant="user" at={new Date('2026-09-05T11:16:00')}>
          Sounds good — see you at noon!
        </ChatMessage>
        <ChatMessage from="Dana" at={new Date('2026-09-05T11:16:30')}>
          👌
        </ChatMessage>
      </ChatThread>
    </Chat>
  );
}
