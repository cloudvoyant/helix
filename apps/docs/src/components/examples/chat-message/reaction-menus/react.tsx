// apps/docs/src/components/examples/chat-message/reaction-menus/react.tsx
import { useState } from 'react';
import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-react';
import type { ChatReactions } from '@cloudvoyant/vortex-ui';

export default function ReactChatMessageReactionMenus() {
  const [reactions, setReactions] = useState<ChatReactions>({});
  const [mine, setMine] = useState<string[]>([]);

  const toggle = (icon: string) => {
    const active = mine.includes(icon);
    setReactions((counts) => ({ ...counts, [icon]: Math.max(0, (counts[icon] ?? 0) + (active ? -1 : 1)) }));
    setMine(active ? mine.filter((i) => i !== icon) : [...mine, icon]);
  };

  return (
    <Chat className="h-64">
      <ChatThread>
        <ChatMessage from="Sam" reactions={reactions} activeReactions={mine} onReactionToggle={toggle}>
          Pick a reaction from the menus below.
        </ChatMessage>
      </ChatThread>
    </Chat>
  );
}
