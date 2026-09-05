// Closely based on: shadcn AI Elements Message, Conversation, and Prompt Input.
import { cva, type VariantProps } from 'class-variance-authority';
import { micromark } from 'micromark';

export type ChatVariant = 'slack' | 'ios' | 'minimal';
export type ChatMessageRole = 'default' | 'user' | 'agent';
export type ChatMessageStatus = 'waiting' | 'sending' | 'streaming' | 'completed' | 'retrying' | 'cancelled' | 'failed';
export type ChatMessageFormat = 'text' | 'markdown';
export type ChatReactionVariant = 'emoji' | 'rate';
export type AgenticChatStreamingState = 'idle' | 'waiting' | 'streaming' | 'completed' | 'retrying' | 'cancelled';

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  file?: File;
}

interface ChatReactionBase {
  key: string;
  label: string;
  value: string;
  count: number;
  reacted?: boolean;
}

export type ChatReaction =
  | (ChatReactionBase & { variant?: 'emoji'; icon?: never })
  | (ChatReactionBase & { variant: 'rate'; icon: 'thumbs-up' | 'thumbs-down' });

export interface ChatMessageData {
  id: string;
  role: ChatMessageRole;
  content: string;
  from?: string;
  at?: Date | string;
  status?: ChatMessageStatus;
  format?: ChatMessageFormat;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
}

export interface ChatSendPayload {
  text: string;
  attachments: ChatAttachment[];
}

export interface AgenticChatState {
  messages: ChatMessageData[];
  streamingContent: string;
  streamingState: AgenticChatStreamingState;
}

export function createChatAttachment(
  file: File,
  id = `${file.name}-${file.lastModified}-${file.size}`,
): ChatAttachment {
  return { id, name: file.name, type: file.type, size: file.size, file };
}

export function formatChatTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function renderChatMarkdown(value: string): string {
  return micromark(value, { allowDangerousHtml: false, allowDangerousProtocol: false });
}

export const chatVariants = cva(
  'not-prose flex min-h-0 w-full flex-col overflow-hidden bg-background text-foreground',
  {
    variants: {
      variant: {
        slack: 'rounded-lg border border-border',
        ios: 'rounded-2xl border border-border shadow-sm',
        minimal: 'border-y border-border/60',
      },
    },
    defaultVariants: { variant: 'slack' },
  },
);

export type ChatVariants = VariantProps<typeof chatVariants>;
export const chatThreadBase = 'relative min-h-0 flex-1 overflow-y-auto overscroll-contain';
export const chatThreadContentBase = 'flex min-w-0 flex-col gap-3 p-4';
export const chatVirtualContentBase = 'relative w-full';
export const chatVirtualItemBase = 'absolute left-0 top-0 w-full pb-3';

export const chatMessageVariants = cva('group flex min-w-0 gap-2', {
  variants: {
    role: {
      default: 'justify-start',
      user: 'justify-end',
      agent: 'justify-start',
    },
    layout: {
      slack: '[&_[data-chat-message-surface]]:max-w-[85%]',
      ios: '[&_[data-chat-message-surface]]:max-w-[80%]',
      minimal: '[&_[data-chat-message-surface]]:max-w-full',
    },
  },
  compoundVariants: [
    { role: 'user', layout: 'slack', className: 'justify-start' },
    { role: 'user', layout: 'minimal', className: 'justify-start' },
  ],
  defaultVariants: { role: 'default', layout: 'slack' },
});

export type ChatMessageVariants = VariantProps<typeof chatMessageVariants>;
export const chatMessageSurfaceVariants = cva('min-w-0 rounded-xl px-3 py-2 text-sm', {
  variants: {
    role: {
      default: 'border border-border bg-card text-card-foreground',
      user: 'bg-primary text-primary-foreground',
      agent: 'bg-muted text-foreground',
    },
    layout: {
      slack: 'rounded-md',
      ios: 'rounded-2xl',
      minimal: 'w-full rounded-none bg-transparent px-0',
    },
  },
  defaultVariants: { role: 'default', layout: 'slack' },
});
export const chatMessageMetaBase = 'mb-1 flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground';
export const chatMessageBodyBase =
  'min-w-0 break-words whitespace-pre-wrap [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-background/70 [&_code]:px-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-background/70 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5';
export const chatMessageStatusBase = 'mt-1 text-right text-[0.6875rem] opacity-70';
export const chatAttachmentListBase = 'mt-2 flex flex-wrap gap-2';
export const chatAttachmentBase =
  'inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-foreground';
export const chatReactionListBase = 'mt-2 flex flex-wrap gap-1';
export const chatReactionBase =
  'inline-flex min-h-7 items-center gap-1 rounded-full border border-border bg-background px-2 text-xs text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[pressed=true]:border-primary data-[pressed=true]:bg-primary/10';
export const chatInputRootBase = 'border-t border-border bg-background p-3';
export const chatInputComposerBase =
  'flex items-end gap-2 rounded-xl border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring/50';
export const chatInputTextareaBase =
  'max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground';
export const chatInputActionBase =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
export const chatInputSendBase = 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground';
export const chatInputAttachmentBase =
  'flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground';
export const chatTypingBase = 'flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground';
export const agentStreamingMessageBase = 'mx-4 mb-3 rounded-lg bg-muted px-3 py-2 text-sm text-foreground';
