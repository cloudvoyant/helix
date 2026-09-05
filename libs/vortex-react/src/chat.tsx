// libs/vortex-react/src/chat.tsx
// Chat surface: root, thread, and typing indicator. Composed from Ark UI
// factory elements (@ark-ui/react/factory); chat styling and behavior are
// original to vortex-ui — no upstream chat primitive exists in
// Shark/Tark/Ark/Chakra/shadcn.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ark, type HTMLArkProps } from '@ark-ui/react/factory';
import {
  chatThreadVariants,
  chatTypingBase,
  chatTypingDotBase,
  cn,
  type ChatMessageData,
  type ChatThreadVariant,
  type ChatVariant,
} from '@cloudvoyant/vortex-ui';
import { ChatContext, type ChatContextValue } from './chat-context';
import { ChatMessage } from './chat-message';

export interface ChatProps extends HTMLArkProps<'div'> {
  /** Thread layout provided to nested messages. Default `slack`. */
  variant?: ChatVariant;
}

/** Presentational chat root: provides the thread variant and a flex column shell. */
export function Chat({ variant = 'slack', className, ...props }: ChatProps) {
  const value: ChatContextValue = { threadVariant: variant };
  return (
    <ChatContext.Provider value={value}>
      <ark.div className={cn('flex h-full min-h-0 flex-col', className)} {...props} />
    </ChatContext.Provider>
  );
}

export interface TypingIndicatorProps {
  /** Accessible announcement for assistive tech. Default `typing…`. */
  label?: string;
  className?: string;
}

/** Animated three-dot typing indicator with a visually hidden announcement. */
export function TypingIndicator({ label = 'typing…', className }: TypingIndicatorProps) {
  return (
    <span role="status" className={cn(chatTypingBase, className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className={cn(chatTypingBase)}>
        {[0, 150, 300].map((delay) => (
          <span key={delay} className={chatTypingDotBase} style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
    </span>
  );
}

export interface ChatThreadProps extends Omit<HTMLArkProps<'div'>, 'children'> {
  /** Overrides the thread variant inherited from the surrounding Chat. */
  variant?: ChatThreadVariant;
  /** Data mode: renders a ChatMessage per item. Omit to render children directly. */
  messages?: readonly ChatMessageData[];
  /** Virtualize data-mode rows via @tanstack/react-virtual (optional peer dep). Falls back to the full list until the module resolves or when it is not installed. */
  virtual?: boolean;
  /** Estimated row height in px for virtualization. Default 64. */
  estimateSize?: () => number;
  /** Fires once each time the thread reaches the top; re-arms after scrolling back down. Wire history loading. */
  onScrollTop?: () => void;
  children?: ReactNode;
}

/** Message list with its own native scroll container. */
export function ChatThread({
  variant,
  messages,
  virtual = false,
  estimateSize = () => 64,
  onScrollTop,
  children,
  className,
  ...props
}: ChatThreadProps) {
  const threadVariant = variant ?? 'slack';
  const scrollRef = useRef<HTMLDivElement>(null);
  const atTopRef = useRef(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !onScrollTop) return;
    if (el.scrollTop <= 16) {
      if (!atTopRef.current) {
        atTopRef.current = true;
        onScrollTop();
      }
    } else if (el.scrollTop > 48) {
      atTopRef.current = false;
    }
  };

  return (
    <ark.div
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn(chatThreadVariants({ variant: threadVariant }), className)}
      {...props}
    >
      {messages ? (
        virtual ? (
          <VirtualRows messages={messages} scrollRef={scrollRef} estimateSize={estimateSize} />
        ) : (
          messages.map((message) => <MessageRow key={message.id} message={message} />)
        )
      ) : (
        children
      )}
    </ark.div>
  );
}

function MessageRow({ message }: { message: ChatMessageData }) {
  return (
    <ChatMessage
      variant={message.variant}
      from={message.from}
      at={message.at}
      reactions={message.reactions}
      attachments={message.attachments}
    >
      {message.content}
    </ChatMessage>
  );
}

/** Loads @tanstack/react-virtual dynamically; stays null when absent (full-list fallback). */
function useReactVirtualModule(): typeof import('@tanstack/react-virtual') | null {
  const [mod, setMod] = useState<typeof import('@tanstack/react-virtual') | null>(null);
  useEffect(() => {
    let live = true;
    import('@tanstack/react-virtual')
      .then((m) => {
        if (live) setMod(m);
      })
      .catch(() => {
        // optional peer dependency not installed — keep the full-list fallback
      });
    return () => {
      live = false;
    };
  }, []);
  return mod;
}

type VirtualModule = typeof import('@tanstack/react-virtual');

/** Chooses between the full-list fallback and the virtualized list. */
function VirtualRows({
  messages,
  scrollRef,
  estimateSize,
}: {
  messages: readonly ChatMessageData[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  estimateSize: () => number;
}) {
  const mod = useReactVirtualModule();
  if (!mod) {
    return (
      <>
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
      </>
    );
  }
  return <VirtualizedRows mod={mod} messages={messages} scrollRef={scrollRef} estimateSize={estimateSize} />;
}

/** Owns the virtualizer hook — only mounted once the module has resolved. */
function VirtualizedRows({
  mod,
  messages,
  scrollRef,
  estimateSize,
}: {
  mod: VirtualModule;
  messages: readonly ChatMessageData[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  estimateSize: () => number;
}) {
  const virtualizer = mod.useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    overscan: 8,
  });
  return (
    <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
      {virtualizer.getVirtualItems().map((item) => (
        <div
          key={messages[item.index].id}
          data-index={item.index}
          ref={virtualizer.measureElement}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}
        >
          <MessageRow message={messages[item.index]} />
        </div>
      ))}
    </div>
  );
}
