// libs/vortex-react/src/chat-context.ts
// Thread-variant context shared by the chat family. Standalone module so
// chat.tsx and chat-message.tsx consume it without importing each other.
import { createContext, useContext } from 'react';
import type { ChatThreadVariant } from '@cloudvoyant/vortex-ui';

export interface ChatContextValue {
  threadVariant: ChatThreadVariant;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

/** Reads the surrounding Chat's thread variant; defaults to `slack`. */
export function useChatContext(): ChatContextValue {
  return useContext(ChatContext) ?? { threadVariant: 'slack' };
}
