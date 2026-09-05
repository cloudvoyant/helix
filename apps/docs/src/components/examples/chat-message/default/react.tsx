import { Chat, ChatMessage, ChatThread } from '@cloudvoyant/vortex-react';

export default function ReactChatMessageDefault() {
  return (
    <Chat variant="ios" className="h-[28rem]">
      <ChatThread>
        <ChatMessage id="regular" role="default" from="Avery" at="2026-09-05T10:00:00Z">
          Regular message
        </ChatMessage>
        <ChatMessage id="user" role="user" from="You" at="2026-09-05T10:01:00Z" status="sending">
          Message from the current user
        </ChatMessage>
        <ChatMessage
          id="agent"
          role="agent"
          from="Agent"
          at="2026-09-05T10:02:00Z"
          content={'**Agent message** with `rich Markdown`.'}
          attachments={[{ id: 'report', name: 'report.md', type: 'text/markdown', size: 128 }]}
          reactions={[
            { key: 'celebrate', label: 'Celebrate', value: '🎉', count: 2, variant: 'emoji' },
            { key: 'helpful', label: 'Helpful', value: '👍', count: 4, variant: 'rate', icon: 'thumbs-up' },
            {
              key: 'not-helpful',
              label: 'Not helpful',
              value: '👎',
              count: 0,
              variant: 'rate',
              icon: 'thumbs-down',
            },
          ]}
        />
      </ChatThread>
    </Chat>
  );
}
