// libs/vortex-svelte/src/chat/context.ts
// Thread-variant context shared by the chat family. Mirrored from
// @cloudvoyant/vortex-react chat-context.ts.
import { getContext, setContext } from 'svelte';
import type { ChatThreadVariant } from '@cloudvoyant/vortex-ui';

export interface ChatContextValue {
  threadVariant: ChatThreadVariant;
}

const CHAT_CONTEXT_KEY = 'vortex-chat';

/** Provides the thread variant to nested chat components. Call during component init. */
export function provideChatContext(value: ChatContextValue): ChatContextValue {
  return setContext(CHAT_CONTEXT_KEY, value);
}

/** Reads the surrounding Chat's thread variant; defaults to `slack`. */
export function useChatContext(): ChatContextValue {
  return getContext<ChatContextValue>(CHAT_CONTEXT_KEY) ?? { threadVariant: 'slack' };
}
