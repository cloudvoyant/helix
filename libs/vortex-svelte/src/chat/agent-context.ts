// libs/vortex-svelte/src/chat/agent-context.ts
// Agent chat context: the controller plus thread variant. Mirrored from
// @cloudvoyant/vortex-react agent-chat.tsx.
import { getContext, setContext } from 'svelte';
import type { ChatThreadVariant } from '@cloudvoyant/vortex-ui';
import type { AgenticChatController } from './use-agentic-chat.svelte';

export interface AgentChatContextValue {
  chat: AgenticChatController;
  threadVariant: ChatThreadVariant;
}

const AGENT_CHAT_CONTEXT_KEY = 'vortex-agent-chat';

/** Provides the agent chat controller to nested components. Call during component init. */
export function provideAgentChatContext(value: AgentChatContextValue): AgentChatContextValue {
  return setContext(AGENT_CHAT_CONTEXT_KEY, value);
}

/** Reads the surrounding AgentChat context, or null when standalone. */
export function useAgentChatContext(): AgentChatContextValue | null {
  return getContext<AgentChatContextValue>(AGENT_CHAT_CONTEXT_KEY) ?? null;
}
