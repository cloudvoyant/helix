import { Chat, ChatInput, ChatMessage, ChatThread, ChatTypingIndicator } from '@cloudvoyant/vortex-react';
import type { ChatMessageData } from '@cloudvoyant/vortex-ui';
import { useState } from 'react';

export default function ReactChatDefault() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: 'hello',
      role: 'default',
      from: 'Avery',
      content: 'Try sending a message or attaching a file.',
      status: 'completed',
    },
  ]);
  const [typing, setTyping] = useState(true);
  const [disabled, setDisabled] = useState(false);
  return (
    <Chat variant="slack" className="h-[30rem]">
      <ChatThread>
        {messages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}
        {typing && <ChatTypingIndicator label="Avery is typing" />}
      </ChatThread>
      <button type="button" onClick={() => setDisabled((value) => !value)}>
        {disabled ? 'Enable input' : 'Disable input'}
      </button>
      <ChatInput
        disabled={disabled}
        removeIcon={
          <span data-custom-remove-icon aria-hidden="true">
            Remove
          </span>
        }
        onSend={async ({ text, attachments }) => {
          const id = `demo-${messages.length}`;
          setMessages((current) => [
            ...current,
            { id, role: 'user', from: 'You', content: text || 'Attachment', attachments, status: 'sending' },
          ]);
          setTyping(false);
          await new Promise((resolve) => window.setTimeout(resolve, 200));
          setMessages((current) =>
            current.map((message) => (message.id === id ? { ...message, status: 'completed' } : message)),
          );
        }}
      />
    </Chat>
  );
}
