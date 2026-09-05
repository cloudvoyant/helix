// libs/vortex-react/src/agent-chat.tsx
// Agentic layer over the presentational chat family: useAgenticChat (a thin
// useReducer binding over the core agenticChatReducer), AgentChat (context
// root carrying the controller and thread variant), and AgentStreamingMessage
// (the streaming tail with caret / typing indicator).
import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { ark, type HTMLArkProps } from '@ark-ui/react/factory';
import {
  agenticChatReducer,
  chatBubbleVariants,
  chatCaretBase,
  chatRowVariants,
  cn,
  initialAgenticChatState,
  type AgenticChatEvent,
  type AgenticChatState,
  type AgenticChatStatus,
  type ChatMessageData,
  type ChatThreadVariant,
} from '@cloudvoyant/vortex-ui';
import { TypingIndicator } from './chat';
import { useChatContext } from './chat-context';

export interface AgenticChatController {
  state: AgenticChatState;
  dispatch: (event: AgenticChatEvent) => void;
  addMessage: (message: ChatMessageData) => void;
  prependMessages: (messages: ChatMessageData[]) => void;
  setStreamingText: (text: string) => void;
  setStatus: (status: AgenticChatStatus) => void;
}

/** Agentic chat state machine bound to React state. */
export function useAgenticChat(): AgenticChatController {
  const [state, dispatch] = useReducer(agenticChatReducer, initialAgenticChatState);
  const dispatchEvent = useCallback((event: AgenticChatEvent) => dispatch(event), []);
  return useMemo<AgenticChatController>(
    () => ({
      state,
      dispatch: dispatchEvent,
      addMessage: (message) => dispatchEvent({ type: 'add', message }),
      prependMessages: (messages) => dispatchEvent({ type: 'prepend', messages }),
      setStreamingText: (text) => dispatchEvent({ type: 'pending', text }),
      setStatus: (status) => dispatchEvent({ type: 'status', status }),
    }),
    [state, dispatchEvent],
  );
}

interface AgentChatContextValue {
  chat: AgenticChatController;
  threadVariant: ChatThreadVariant;
}

const AgentChatContext = createContext<AgentChatContextValue | null>(null);

function useAgentChatContext(): AgentChatContextValue | null {
  return useContext(AgentChatContext);
}

export interface AgentChatProps extends HTMLArkProps<'div'> {
  chat: AgenticChatController;
  /** Thread variant for nested ChatThread / AgentStreamingMessage. Default `minimal`. */
  threadVariant?: ChatThreadVariant;
}

/** Agentic chat root: provides the controller context and a flex column shell. */
export function AgentChat({ chat, threadVariant = 'minimal', className, ...props }: AgentChatProps) {
  const value = useMemo<AgentChatContextValue>(() => ({ chat, threadVariant }), [chat, threadVariant]);
  return (
    <AgentChatContext.Provider value={value}>
      <ark.div className={cn('flex h-full min-h-0 flex-col', className)} {...props} />
    </AgentChatContext.Provider>
  );
}

export interface AgentStreamingMessageProps {
  /** Overrides the controller's streaming text. */
  text?: string;
  /** Overrides the controller's active-stream detection. */
  streaming?: boolean;
  className?: string;
}

/** Streaming tail: pending text with a caret, or the typing indicator while waiting. */
export function AgentStreamingMessage({ text, streaming, className }: AgentStreamingMessageProps) {
  const agent = useAgentChatContext();
  const chat = useChatContext();
  const threadVariant = agent?.threadVariant ?? chat.threadVariant;
  const current = text ?? agent?.chat.state.pending ?? '';
  const active =
    streaming ?? (agent ? ['waiting', 'streaming', 'retrying'].includes(agent.chat.state.status) : false);
  if (!active && current === '') return null;
  return (
    <div aria-live="polite" className={cn(chatRowVariants({ variant: threadVariant, role: 'agent' }), className)}>
      {current === '' ? (
        <TypingIndicator />
      ) : (
        <div className={cn(chatBubbleVariants({ variant: threadVariant, role: 'agent' }))}>
          {current}
          {active ? <span aria-hidden="true" className={chatCaretBase} /> : null}
        </div>
      )}
    </div>
  );
}
