// Closely based on: shadcn AI Elements Message, Conversation, and Prompt Input.
import { ark, type HTMLArkProps } from '@ark-ui/react/factory';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ArrowClockwiseIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  FileIcon,
  PaperclipIcon,
  StopIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from '@phosphor-icons/react';
import {
  agentStreamingMessageBase,
  chatAttachmentBase,
  chatAttachmentListBase,
  chatInputActionBase,
  chatInputAttachmentBase,
  chatInputComposerBase,
  chatInputRootBase,
  chatInputSendBase,
  chatInputTextareaBase,
  chatMessageBodyBase,
  chatMessageMetaBase,
  chatMessageStatusBase,
  chatMessageSurfaceVariants,
  chatMessageVariants,
  chatReactionBase,
  chatReactionListBase,
  chatThreadBase,
  chatThreadContentBase,
  chatTypingBase,
  chatVariants,
  chatVirtualContentBase,
  chatVirtualItemBase,
  cn,
  createChatAttachment,
  formatChatTimestamp,
  renderChatMarkdown,
  type AgenticChatState,
  type AgenticChatStreamingState,
  type ChatAttachment,
  type ChatMessageData,
  type ChatMessageFormat,
  type ChatMessageRole,
  type ChatMessageStatus,
  type ChatReaction,
  type ChatReactionVariant,
  type ChatSendPayload,
  type ChatVariant,
} from '@cloudvoyant/vortex-ui';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

const ChatContext = createContext<ChatVariant>('slack');

export type ChatProps = HTMLArkProps<'section'> & { variant?: ChatVariant };

export function Chat({ variant = 'slack', className, children, ...props }: ChatProps) {
  return (
    <ChatContext.Provider value={variant}>
      <ark.section data-chat data-variant={variant} className={cn(chatVariants({ variant }), className)} {...props}>
        {children}
      </ark.section>
    </ChatContext.Provider>
  );
}

export type ChatThreadProps = HTMLArkProps<'div'> & {
  contentClassName?: string;
  topThreshold?: number;
  onScrollTop?: () => void | Promise<void>;
};

export function ChatThread({
  className,
  contentClassName,
  topThreshold = 32,
  onScrollTop,
  children,
  onScroll,
  ...props
}: ChatThreadProps) {
  const insideThreshold = useRef(false);
  return (
    <ark.div
      data-chat-thread
      className={cn(chatThreadBase, className)}
      onScroll={(event) => {
        onScroll?.(event);
        const atTop = event.currentTarget.scrollTop <= topThreshold;
        if (atTop && !insideThreshold.current) void onScrollTop?.();
        insideThreshold.current = atTop;
      }}
      {...props}
    >
      <div className={cn(chatThreadContentBase, contentClassName)}>{children}</div>
    </ark.div>
  );
}

export type ChatMessageReactionProps = Omit<HTMLArkProps<'button'>, 'value'> & {
  reaction: ChatReaction;
  variant?: ChatReactionVariant;
  pressed?: boolean;
  defaultPressed?: boolean;
  icon?: ReactNode;
  onPressedChange?: (pressed: boolean) => void;
};

export function ChatMessageReaction({
  reaction,
  variant = reaction.variant ?? 'emoji',
  pressed,
  defaultPressed = reaction.reacted ?? false,
  icon,
  onPressedChange,
  className,
  onClick,
  ...props
}: ChatMessageReactionProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const active = pressed ?? internalPressed;
  const count = Math.max(0, reaction.count + (active === Boolean(reaction.reacted) ? 0 : active ? 1 : -1));
  return (
    <ark.button
      type="button"
      aria-label={reaction.label}
      aria-pressed={active}
      data-pressed={active}
      data-variant={variant}
      className={cn(chatReactionBase, className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !active;
        if (pressed === undefined) setInternalPressed(next);
        onPressedChange?.(next);
      }}
      {...props}
    >
      {icon ??
        (variant === 'rate' ? (
          reaction.icon === 'thumbs-down' ? (
            <ThumbsDownIcon aria-hidden="true" size={16} weight={active ? 'fill' : 'regular'} />
          ) : (
            <ThumbsUpIcon aria-hidden="true" size={16} weight={active ? 'fill' : 'regular'} />
          )
        ) : (
          <span aria-hidden="true">{reaction.value}</span>
        ))}
      <span>{count}</span>
    </ark.button>
  );
}

export type ChatMessageProps = Omit<HTMLArkProps<'article'>, 'id' | 'role'> & {
  id: string;
  role?: ChatMessageRole;
  from?: string;
  at?: Date | string;
  status?: ChatMessageStatus;
  format?: ChatMessageFormat;
  content?: string;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  attachmentIcon?: ReactNode;
  onReactionChange?: (key: string, pressed: boolean) => void;
};

export function ChatMessage({
  id,
  role = 'default',
  from,
  at,
  status,
  format,
  content = '',
  attachments = [],
  reactions = [],
  attachmentIcon,
  onReactionChange,
  className,
  children,
  ...props
}: ChatMessageProps) {
  const layout = useContext(ChatContext);
  const resolvedFormat = format ?? (role === 'agent' ? 'markdown' : 'text');
  const body = children ?? content;
  const markdown = resolvedFormat === 'markdown' && typeof body === 'string' ? renderChatMarkdown(body) : null;
  return (
    <ark.article
      data-chat-message={id}
      data-role={role}
      data-status={status}
      className={cn(chatMessageVariants({ role, layout }), className)}
      {...props}
    >
      <div data-chat-message-surface className={chatMessageSurfaceVariants({ role, layout })}>
        {(from || at) && (
          <div className={chatMessageMetaBase}>
            {from && <strong>{from}</strong>}
            {at && <time dateTime={at instanceof Date ? at.toISOString() : at}>{formatChatTimestamp(at)}</time>}
          </div>
        )}
        {markdown === null ? (
          <div className={chatMessageBodyBase}>{body}</div>
        ) : (
          <div className={chatMessageBodyBase} dangerouslySetInnerHTML={{ __html: markdown }} />
        )}
        {attachments.length > 0 && (
          <div className={chatAttachmentListBase} aria-label="Attachments">
            {attachments.map((attachment) =>
              attachment.url ? (
                <a key={attachment.id} className={chatAttachmentBase} href={attachment.url} download={attachment.name}>
                  {attachmentIcon ?? <FileIcon aria-hidden="true" size={16} />}
                  <span>{attachment.name}</span>
                </a>
              ) : (
                <span key={attachment.id} className={chatAttachmentBase}>
                  {attachmentIcon ?? <FileIcon aria-hidden="true" size={16} />}
                  <span>{attachment.name}</span>
                </span>
              ),
            )}
          </div>
        )}
        {reactions.length > 0 && (
          <div className={chatReactionListBase} aria-label="Message reactions">
            {reactions.map((reaction) => (
              <ChatMessageReaction
                key={reaction.key}
                reaction={reaction}
                onPressedChange={(value) => onReactionChange?.(reaction.key, value)}
              />
            ))}
          </div>
        )}
        {status && status !== 'completed' && (
          <div className={chatMessageStatusBase} role="status">
            {status}
          </div>
        )}
      </div>
    </ark.article>
  );
}

export type ChatInputProps = Omit<HTMLArkProps<'form'>, 'onSubmit'> & {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  sendLabel?: string;
  attachLabel?: string;
  attachIcon?: ReactNode;
  sendIcon?: ReactNode;
  removeIcon?: ReactNode;
  onValueChange?: (value: string) => void;
  onSend: (payload: ChatSendPayload) => void | Promise<void>;
};

export function ChatInput({
  value,
  defaultValue = '',
  placeholder = 'Message',
  accept,
  multiple = true,
  disabled = false,
  sendLabel = 'Send message',
  attachLabel = 'Attach files',
  attachIcon,
  sendIcon,
  removeIcon,
  onValueChange,
  onSend,
  className,
  ...props
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const text = value ?? internalValue;
  const setText = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const submit = async () => {
    if (disabled || sending || (!text.trim() && attachments.length === 0)) return;
    setSending(true);
    try {
      await onSend({ text: text.trim(), attachments });
      setText('');
      setAttachments([]);
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setSending(false);
    }
  };
  const chooseFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.currentTarget.files ?? []).map((file) => createChatAttachment(file));
    setAttachments((current) => [
      ...current,
      ...next.filter((item) => !current.some((existing) => existing.id === item.id)),
    ]);
  };
  return (
    <ark.form
      data-chat-input
      className={cn(chatInputRootBase, className)}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      {...props}
    >
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2" aria-label="Selected attachments">
          {attachments.map((attachment) => (
            <span key={attachment.id} className={chatInputAttachmentBase}>
              {attachment.name}
              <button
                type="button"
                aria-label={`Remove ${attachment.name}`}
                onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
              >
                {removeIcon ?? <XIcon aria-hidden="true" size={14} />}
              </button>
            </span>
          ))}
        </div>
      )}
      <div className={chatInputComposerBase}>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          tabIndex={-1}
          accept={accept}
          multiple={multiple}
          disabled={disabled || sending}
          onChange={chooseFiles}
        />
        <button
          type="button"
          className={chatInputActionBase}
          aria-label={attachLabel}
          disabled={disabled || sending}
          onClick={() => inputRef.current?.click()}
        >
          {attachIcon ?? <PaperclipIcon aria-hidden="true" size={18} />}
        </button>
        <textarea
          className={chatInputTextareaBase}
          value={text}
          placeholder={placeholder}
          disabled={disabled || sending}
          rows={1}
          onChange={(event) => setText(event.currentTarget.value)}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === 'Enter' && !event.shiftKey && !composing.current) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <button
          type="submit"
          className={cn(chatInputActionBase, chatInputSendBase)}
          aria-label={sendLabel}
          disabled={disabled || sending || (!text.trim() && attachments.length === 0)}
        >
          {sendIcon ?? <ArrowUpIcon aria-hidden="true" size={18} weight="bold" />}
        </button>
      </div>
    </ark.form>
  );
}

export type ChatTypingIndicatorProps = HTMLArkProps<'div'> & { label?: string };

export function ChatTypingIndicator({ label = 'Someone is typing', className, ...props }: ChatTypingIndicatorProps) {
  return (
    <ark.div className={cn(chatTypingBase, className)} role="status" aria-live="polite" {...props}>
      <span>{label}</span>
      <CircleNotchIcon aria-hidden="true" className="animate-spin" size={16} />
    </ark.div>
  );
}

export type AgentStreamingMessageProps = HTMLArkProps<'div'> & {
  content?: string;
  state: AgenticChatStreamingState;
  icon?: ReactNode;
};

export function AgentStreamingMessage({ content = '', state, icon, className, ...props }: AgentStreamingMessageProps) {
  if (state === 'idle' || (state === 'completed' && !content)) return null;
  const label =
    state === 'waiting'
      ? 'Agent is waiting'
      : state === 'retrying'
        ? 'Agent is retrying'
        : state === 'cancelled'
          ? 'Agent response cancelled'
          : state === 'completed'
            ? 'Agent response completed'
            : 'Agent response streaming';
  const stateIcon =
    state === 'retrying' ? (
      <ArrowClockwiseIcon aria-hidden="true" size={16} />
    ) : state === 'cancelled' ? (
      <StopIcon aria-hidden="true" size={16} />
    ) : state === 'completed' ? (
      <CheckCircleIcon aria-hidden="true" size={16} />
    ) : (
      <CircleNotchIcon aria-hidden="true" className="animate-spin" size={16} />
    );
  return (
    <ark.div
      data-agent-streaming={state}
      className={cn(agentStreamingMessageBase, className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <span className="sr-only">{label}</span>
      <span className="mb-1 inline-flex" aria-hidden="true">
        {icon ?? stateIcon}
      </span>
      {content ? (
        <div
          className={chatMessageBodyBase}
          dangerouslySetInnerHTML={{ __html: renderChatMarkdown(content) }}
        />
      ) : null}
    </ark.div>
  );
}

export type UseAgenticChatOptions = { initialMessages?: ChatMessageData[] };

export function useAgenticChat({ initialMessages = [] }: UseAgenticChatOptions = {}) {
  const [state, setState] = useState<AgenticChatState>({
    messages: initialMessages,
    streamingContent: '',
    streamingState: 'idle',
  });
  const prependMessages = useCallback(
    (messages: ChatMessageData[]) =>
      setState((current) => ({ ...current, messages: [...messages, ...current.messages] })),
    [],
  );
  const addMessage = useCallback((message: ChatMessageData) => {
    setState((current) => ({ ...current, messages: [...current.messages, message] }));
    return message;
  }, []);
  const updateMessage = useCallback(
    (id: string, patch: Partial<Omit<ChatMessageData, 'id'>>) =>
      setState((current) => ({
        ...current,
        messages: current.messages.map((message) => (message.id === id ? { ...message, ...patch } : message)),
      })),
    [],
  );
  const removeMessage = useCallback(
    (id: string) =>
      setState((current) => ({ ...current, messages: current.messages.filter((message) => message.id !== id) })),
    [],
  );
  const setStreaming = useCallback(
    (content: string, streamingState: AgenticChatStreamingState = 'streaming') =>
      setState((current) => ({ ...current, streamingContent: content, streamingState })),
    [],
  );
  const cancelStreaming = useCallback(() => setState((current) => ({ ...current, streamingState: 'cancelled' })), []);
  const clearMessages = useCallback(() => setState({ messages: [], streamingContent: '', streamingState: 'idle' }), []);
  return useMemo(
    () => ({
      ...state,
      prependMessages,
      addMessage,
      updateMessage,
      removeMessage,
      setStreaming,
      cancelStreaming,
      clearMessages,
    }),
    [state, prependMessages, addMessage, updateMessage, removeMessage, setStreaming, cancelStreaming, clearMessages],
  );
}

export type AgenticChatProps = Omit<ChatProps, 'children'> & {
  messages: ChatMessageData[];
  children?: ReactNode;
  estimateSize?: number;
  overscan?: number;
  topThreshold?: number;
  followOutput?: boolean;
  onScrollTop?: () => void | Promise<void>;
  renderMessage?: (message: ChatMessageData) => ReactNode;
};

export function AgenticChat({
  messages,
  children,
  estimateSize = 96,
  overscan = 6,
  topThreshold = 32,
  followOutput = true,
  onScrollTop,
  renderMessage,
  variant = 'minimal',
  className,
  ...props
}: AgenticChatProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const insideThreshold = useRef(false);
  const shouldFollow = useRef(true);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    getItemKey: (index) => messages[index]?.id ?? index,
    overscan,
  });
  useEffect(() => {
    if (followOutput && shouldFollow.current && messages.length > 0)
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
  }, [followOutput, messages.length, virtualizer]);
  return (
    <Chat variant={variant} className={className} {...props}>
      <div
        ref={parentRef}
        data-agentic-thread
        className={chatThreadBase}
        onScroll={(event) => {
          const node = event.currentTarget;
          const atTop = node.scrollTop <= topThreshold;
          if (atTop && !insideThreshold.current) void onScrollTop?.();
          insideThreshold.current = atTop;
          shouldFollow.current = node.scrollHeight - node.scrollTop - node.clientHeight <= 64;
        }}
      >
        <div className={chatVirtualContentBase} style={{ height: virtualizer.getTotalSize() }}>
          {(messages.length === 0 ? [] : virtualizer.getVirtualItems()).map((item) => {
            const message = messages[item.index];
            return (
              <div
                key={item.key}
                data-index={item.index}
                ref={virtualizer.measureElement}
                className={chatVirtualItemBase}
                style={{ transform: `translateY(${item.start}px)` }}
              >
                {renderMessage ? renderMessage(message) : <ChatMessage {...message} />}
              </div>
            );
          })}
        </div>
      </div>
      {children}
    </Chat>
  );
}
