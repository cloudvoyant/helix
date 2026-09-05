// apps/docs/src/components/examples/chat-message/reactions/react.tsx
import { useState } from 'react';
import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-react';
import type { ChatReactions } from '@cloudvoyant/vortex-ui';

export default function ReactChatMessageReactions() {
  const [reactions, setReactions] = useState<ChatReactions>({ '👍': 2, '🎉': 1 });
  const [mine, setMine] = useState<string[]>([]);

  const toggle = (icon: string) => {
    const active = mine.includes(icon);
    setReactions((counts) => ({ ...counts, [icon]: Math.max(0, (counts[icon] ?? 0) + (active ? -1 : 1)) }));
    setMine(active ? mine.filter((i) => i !== icon) : [...mine, icon]);
  };

  return (
    <Chat className="h-64">
      <ChatThread>
        <ChatMessage
          from="Sam"
          at={new Date('2026-09-05T09:40:00')}
          reactions={reactions}
          activeReactions={mine}
          onReactionToggle={toggle}
        >
          Click a reaction — the count sticks.
        </ChatMessage>
      </ChatThread>
    </Chat>
  );
}
