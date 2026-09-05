// libs/vortex-ui/src/chat.ts
// Chat family: shared types, cva variants, base class strings, and the pure
// agentic streaming reducer. No upstream chat primitive exists in
// Shark/Tark/Ark/Chakra/shadcn — the framework packages compose this family
// from Ark primitives already in the repo; the state machine is original.
import { cva, type VariantProps } from 'class-variance-authority';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Root `Chat` surface variant. `minimal` exists only at the thread level. */
export type ChatVariant = 'slack' | 'ios';
/** Thread layout: `slack` left-aligns everything, `ios` floats own messages right as accent bubbles, `minimal` drops bubbles and labels for styling-only distinction. */
export type ChatThreadVariant = 'slack' | 'ios' | 'minimal';
/** Message role: `user` (own messages), `agent` (AI agent), `default` (other people). */
export type ChatMessageVariant = 'user' | 'agent' | 'default';
/** Transient message state. Absence means the message is settled. */
export type ChatMessageStatus = 'sending' | 'streaming' | 'error';
/** Agentic stream lifecycle. */
export type AgenticChatStatus = 'idle' | 'waiting' | 'streaming' | 'completed' | 'retrying' | 'cancelled';

export interface ChatAttachment {
  id: string;
  name: string;
  url?: string;
}

/** Reaction counts keyed by unicode emoji or the icon keys `thumbs-up` / `thumbs-down`. */
export type ChatReactions = Record<string, number>;

export const THUMBS_UP = 'thumbs-up';
export const THUMBS_DOWN = 'thumbs-down';

/** Data-mode message: what `ChatThread messages={…}` and `useAgenticChat` manage. */
export interface ChatMessageData {
  id: string;
  variant: ChatMessageVariant;
  content: string;
  from?: string;
  at?: Date;
  reactions?: ChatReactions;
  attachments?: ChatAttachment[];
}

export interface AgenticChatState {
  messages: ChatMessageData[];
  /** Text accumulated for the in-flight agent reply; rendered by `AgentStreamingMessage`. */
  pending: string;
  status: AgenticChatStatus;
  error?: string;
}

export type AgenticChatEvent =
  | { type: 'start' }
  | { type: 'delta'; text: string }
  | { type: 'retry' }
  | { type: 'cancel' }
  | { type: 'fail'; error: string }
  | { type: 'done'; id: string }
  | { type: 'add'; message: ChatMessageData }
  | { type: 'prepend'; messages: ChatMessageData[] }
  | { type: 'status'; status: AgenticChatStatus }
  | { type: 'pending'; text: string };

export const initialAgenticChatState: AgenticChatState = { messages: [], pending: '', status: 'idle' };

const STREAMING_ENTRY_STATUSES: readonly AgenticChatStatus[] = ['idle', 'waiting', 'retrying'];

/**
 * Pure fold of agentic stream events into `AgenticChatState`. Ids and dates are
 * always caller-supplied — the reducer never calls `Date`/`crypto` and never
 * mutates its input.
 */
export function agenticChatReducer(state: AgenticChatState, event: AgenticChatEvent): AgenticChatState {
  switch (event.type) {
    case 'start':
      return { ...state, status: 'waiting', error: undefined };
    case 'delta': {
      const status: AgenticChatStatus = STREAMING_ENTRY_STATUSES.includes(state.status) ? 'streaming' : state.status;
      return { ...state, pending: state.pending + event.text, status };
    }
    case 'retry':
      return { ...state, status: 'retrying', error: undefined };
    case 'cancel':
      return { ...state, status: 'cancelled' };
    case 'fail':
      return { ...state, status: 'cancelled', error: event.error };
    case 'done': {
      if (state.pending === '') return { ...state, status: 'completed', error: undefined };
      const message: ChatMessageData = { id: event.id, variant: 'agent', content: state.pending };
      return { messages: [...state.messages, message], pending: '', status: 'completed', error: undefined };
    }
    case 'add':
      return { ...state, messages: [...state.messages, event.message] };
    case 'prepend':
      return { ...state, messages: [...event.messages, ...state.messages] };
    case 'status':
      return { ...state, status: event.status };
    case 'pending':
      return { ...state, pending: event.text };
  }
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export const chatThreadVariants = cva('flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain', {
  variants: {
    variant: {
      slack: 'gap-4 px-4 py-4',
      ios: 'gap-1.5 px-3 py-3',
      minimal: 'gap-5 px-1 py-2',
    },
  },
  defaultVariants: {
    variant: 'slack',
  },
});

/** Message row: alignment only — `ios` floats own messages to the right. */
export const chatRowVariants = cva('flex w-full', {
  variants: {
    variant: { slack: '', ios: '', minimal: '' },
    role: { user: '', agent: '', default: '' },
  },
  compoundVariants: [{ variant: 'ios', role: 'user', className: 'justify-end' }],
  defaultVariants: { variant: 'slack', role: 'default' },
});

export const chatBubbleVariants = cva('max-w-full whitespace-pre-wrap break-words text-sm leading-relaxed', {
  variants: {
    variant: {
      slack: 'max-w-[85%] rounded-lg border border-border bg-card px-3 py-2',
      ios: 'max-w-[78%] rounded-2xl px-3.5 py-2',
      minimal: 'max-w-none px-0 py-0',
    },
    role: { user: '', agent: '', default: '' },
  },
  compoundVariants: [
    { variant: 'ios', role: 'user', className: 'rounded-br-md bg-primary text-primary-foreground' },
    { variant: 'ios', role: 'agent', className: 'rounded-bl-md border border-border bg-card text-card-foreground' },
    { variant: 'ios', role: 'default', className: 'rounded-bl-md bg-muted text-foreground' },
    { variant: 'slack', role: 'user', className: 'border-transparent bg-primary text-primary-foreground' },
    { variant: 'slack', role: 'agent', className: 'text-card-foreground' },
    { variant: 'slack', role: 'default', className: 'text-card-foreground' },
    { variant: 'minimal', role: 'user', className: 'font-medium text-foreground' },
    { variant: 'minimal', role: 'agent', className: 'text-foreground' },
    { variant: 'minimal', role: 'default', className: 'text-muted-foreground' },
  ],
  defaultVariants: { variant: 'slack', role: 'default' },
});

// ---------------------------------------------------------------------------
// Base class strings
// ---------------------------------------------------------------------------

export const chatMetaBase = 'flex items-center gap-1.5 text-xs text-muted-foreground';
export const chatReactionsBase = 'flex flex-wrap items-center gap-1';
export const chatReactionPillBase =
  'inline-flex h-6 items-center gap-1 rounded-full border border-border bg-background px-2 text-xs text-foreground transition-colors hover:bg-muted aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-foreground';
export const chatReactionMenuTriggerBase =
  'size-6 justify-center rounded-full border border-dashed border-border p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';
export const chatReactionGridBase = 'grid grid-cols-4 gap-1';
export const chatReactionGridItemBase = 'rounded-md p-1 text-base transition-colors hover:bg-muted';
export const chatTypingBase = 'inline-flex items-center gap-0.5';
export const chatTypingDotBase = 'size-1.5 animate-bounce rounded-full bg-muted-foreground';
export const chatCaretBase = 'ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-foreground align-middle';
export const chatComposerBase = 'flex flex-col gap-2 border-t border-border p-3';
export const chatComposerRowBase = 'flex items-end gap-2';
export const chatAttachmentChipBase =
  'inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground';

/** Default emoji set offered by the `ReactionEmoji` menu. */
export const DEFAULT_REACTION_EMOJIS: readonly string[] = ['👍', '👎', '❤️', '😂', '😮', '🎉', '👀', '🙏'];

export type ChatThreadVariants = VariantProps<typeof chatThreadVariants>;
export type ChatRowVariants = VariantProps<typeof chatRowVariants>;
export type ChatBubbleVariants = VariantProps<typeof chatBubbleVariants>;
