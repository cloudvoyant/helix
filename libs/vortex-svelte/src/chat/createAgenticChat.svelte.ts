import type { AgenticChatState, AgenticChatStreamingState, ChatMessageData } from '@cloudvoyant/vortex-ui';

export type CreateAgenticChatOptions = { initialMessages?: ChatMessageData[] };

export function createAgenticChat({ initialMessages = [] }: CreateAgenticChatOptions = {}) {
  let state = $state<AgenticChatState>({
    messages: initialMessages,
    streamingContent: '',
    streamingState: 'idle',
  });
  return {
    get messages() {
      return state.messages;
    },
    get streamingContent() {
      return state.streamingContent;
    },
    get streamingState() {
      return state.streamingState;
    },
    prependMessages(messages: ChatMessageData[]) {
      state.messages = [...messages, ...state.messages];
    },
    addMessage(message: ChatMessageData) {
      state.messages = [...state.messages, message];
      return message;
    },
    updateMessage(id: string, patch: Partial<Omit<ChatMessageData, 'id'>>) {
      state.messages = state.messages.map((message) => (message.id === id ? { ...message, ...patch } : message));
    },
    removeMessage(id: string) {
      state.messages = state.messages.filter((message) => message.id !== id);
    },
    setStreaming(content: string, streamingState: AgenticChatStreamingState = 'streaming') {
      state.streamingContent = content;
      state.streamingState = streamingState;
    },
    cancelStreaming() {
      state.streamingState = 'cancelled';
    },
    clearMessages() {
      state = { messages: [], streamingContent: '', streamingState: 'idle' };
    },
  };
}
