// libs/vortex-svelte/src/chat/use-agentic-chat.svelte.ts
// Runes-based binding over the core agenticChatReducer. Mirrored from
// @cloudvoyant/vortex-react useAgenticChat.
import {
  agenticChatReducer,
  initialAgenticChatState,
  type AgenticChatEvent,
  type AgenticChatState,
  type AgenticChatStatus,
  type ChatMessageData,
} from '@cloudvoyant/vortex-ui';

export interface AgenticChatController {
  readonly state: AgenticChatState;
  readonly messages: ChatMessageData[];
  readonly pending: string;
  readonly status: AgenticChatStatus;
  readonly error: string | undefined;
  dispatch(event: AgenticChatEvent): void;
  addMessage(message: ChatMessageData): void;
  prependMessages(messages: ChatMessageData[]): void;
  setStreamingText(text: string): void;
  setStatus(status: AgenticChatStatus): void;
}

/** Agentic chat state machine as a Svelte 5 runes hook. */
export function useAgenticChat(): AgenticChatController {
  let state = $state<AgenticChatState>(initialAgenticChatState);

  function dispatch(event: AgenticChatEvent) {
    state = agenticChatReducer(state, event);
  }

  return {
    get state() {
      return state;
    },
    get messages() {
      return state.messages;
    },
    get pending() {
      return state.pending;
    },
    get status() {
      return state.status;
    },
    get error() {
      return state.error;
    },
    dispatch,
    addMessage: (message) => dispatch({ type: 'add', message }),
    prependMessages: (messages) => dispatch({ type: 'prepend', messages }),
    setStreamingText: (text) => dispatch({ type: 'pending', text }),
    setStatus: (status) => dispatch({ type: 'status', status }),
  };
}
