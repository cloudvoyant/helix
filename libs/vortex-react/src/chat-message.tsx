// libs/vortex-react/src/chat-message.tsx
// ChatMessage with roles, transient statuses, attachments, and the controlled
// reactions model; plus the reaction parts: ChatMessageReaction pill,
// ReactionEmoji popover menu (repo Popover over Ark UI popover), and
// ReactionRate thumbs group. Icons are Phosphor Icons (@phosphor-icons/react).
import { useState, type ReactNode } from 'react';
import { ark, type HTMLArkProps } from '@ark-ui/react/factory';
import {
  DEFAULT_REACTION_EMOJIS,
  THUMBS_DOWN,
  THUMBS_UP,
  chatAttachmentChipBase,
  chatBubbleVariants,
  chatCaretBase,
  chatMetaBase,
  chatReactionGridBase,
  chatReactionGridItemBase,
  chatReactionMenuTriggerBase,
  chatReactionPillBase,
  chatReactionsBase,
  chatRowVariants,
  cn,
  type ChatAttachment,
  type ChatMessageStatus,
  type ChatMessageVariant,
  type ChatReactions,
} from '@cloudvoyant/vortex-ui';
import { SmileyIcon, ThumbsDownIcon, ThumbsUpIcon } from '@phosphor-icons/react';
import { useChatContext } from './chat-context';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function reactionIcon(icon: string): ReactNode {
  if (icon === THUMBS_UP) return <ThumbsUpIcon />;
  if (icon === THUMBS_DOWN) return <ThumbsDownIcon />;
  return <span aria-hidden="true">{icon}</span>;
}

function reactionLabel(icon: string): string {
  if (icon === THUMBS_UP) return 'Thumbs up';
  if (icon === THUMBS_DOWN) return 'Thumbs down';
  return `React ${icon}`;
}

export interface ChatMessageReactionProps {
  icon: ReactNode;
  /** Accessible name for the pill. */
  label?: string;
  count?: number;
  /** Renders the pill pressed (`aria-pressed`). */
  active?: boolean;
  onToggle?: () => void;
  className?: string;
}

/** Single reaction pill — emoji or icon plus optional count. */
export function ChatMessageReaction({
  icon,
  label,
  count = 0,
  active = false,
  onToggle,
  className,
}: ChatMessageReactionProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label ?? 'Reaction'}
      title={label}
      className={cn(chatReactionPillBase, className)}
      onClick={onToggle}
    >
      {icon}
      {count > 0 ? <span>{count}</span> : null}
    </button>
  );
}

export interface ReactionEmojiProps {
  /** Emoji keys offered in the grid. Defaults to `DEFAULT_REACTION_EMOJIS`. */
  emojis?: readonly string[];
  /** Called with the picked emoji; the menu closes itself. */
  onSelect: (emoji: string) => void;
  /** Accessible label for the trigger. Default `Add reaction`. */
  label?: string;
  className?: string;
}

/** iOS-style emoji reaction menu in a popover. */
export function ReactionEmoji({ emojis = DEFAULT_REACTION_EMOJIS, onSelect, label = 'Add reaction', className }: ReactionEmojiProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={(details) => setOpen(details.open)}>
      <PopoverTrigger aria-label={label} className={cn(chatReactionMenuTriggerBase, className)}>
        <SmileyIcon />
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <div aria-label="Choose a reaction" className={cn(chatReactionGridBase)}>
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={reactionLabel(emoji)}
              className={cn(chatReactionGridItemBase)}
              onClick={() => {
                setOpen(false);
                onSelect(emoji);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface ReactionRateProps {
  /** Reaction counts; only `thumbs-up` / `thumbs-down` keys are used. */
  counts: ChatReactions;
  /** Reaction keys the current viewer has active (rendered pressed). */
  active?: string[];
  onToggle: (icon: string) => void;
  className?: string;
}

/** Thumbs up/down rating pair. */
export function ReactionRate({ counts, active = [], onToggle, className }: ReactionRateProps) {
  const items = [
    { key: THUMBS_UP, icon: <ThumbsUpIcon />, label: 'Thumbs up' },
    { key: THUMBS_DOWN, icon: <ThumbsDownIcon />, label: 'Thumbs down' },
  ];
  return (
    <span className={cn(chatReactionsBase, className)}>
      {items.map((item) => (
        <ChatMessageReaction
          key={item.key}
          icon={item.icon}
          label={item.label}
          count={counts[item.key] ?? 0}
          active={active.includes(item.key)}
          onToggle={() => onToggle(item.key)}
        />
      ))}
    </span>
  );
}

export interface ChatMessageProps extends Omit<HTMLArkProps<'div'>, 'children'> {
  /** Message role: `user` (own), `agent`, `default` (other people). Default `default`. */
  variant?: ChatMessageVariant;
  /** Transient state: `sending` dims, `streaming` adds the caret, `error` outlines destructively. */
  status?: ChatMessageStatus;
  /** Sender label rendered in the meta row (hidden in `minimal`). */
  from?: string;
  /** Timestamp rendered in the meta row (hidden in `minimal`). */
  at?: Date;
  /** Controlled reaction counts keyed by emoji or `thumbs-up`/`thumbs-down`. */
  reactions?: ChatReactions;
  /** Reaction keys the current viewer has active (rendered pressed). */
  activeReactions?: string[];
  /** Rendered as chips below the message body. */
  attachments?: ChatAttachment[];
  /** Enables pill toggling and the ReactionEmoji / ReactionRate menus. */
  onReactionToggle?: (icon: string) => void;
  children?: ReactNode;
}

/** One chat message: meta row, bubble, attachments, and reactions. */
export function ChatMessage({
  variant = 'default',
  status,
  from,
  at,
  reactions,
  activeReactions = [],
  attachments,
  onReactionToggle,
  children,
  className,
  ...props
}: ChatMessageProps) {
  const { threadVariant } = useChatContext();
  const showMeta = threadVariant !== 'minimal' && (from !== undefined || at !== undefined);
  const entries = Object.entries(reactions ?? {});
  const plainEntries = onReactionToggle
    ? entries.filter(([icon]) => icon !== THUMBS_UP && icon !== THUMBS_DOWN)
    : entries;
  return (
    <ark.div className={cn(chatRowVariants({ variant: threadVariant, role: variant }), className)} {...props}>
      <div className="flex max-w-full flex-col gap-1">
        {showMeta ? (
          <div className={cn(chatMetaBase, variant === 'user' && 'flex-row-reverse')}>
            {from ? <span className="font-medium text-foreground">{from}</span> : null}
            {at ? (
              <time dateTime={at.toISOString()}>{at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
            ) : null}
          </div>
        ) : null}
        <div
          className={cn(
            chatBubbleVariants({ variant: threadVariant, role: variant }),
            status === 'sending' && 'opacity-60',
            status === 'error' && 'border-destructive/60 text-destructive',
          )}
        >
          {children}
          {status === 'streaming' ? <span aria-hidden="true" className={chatCaretBase} /> : null}
          {attachments && attachments.length > 0 ? (
            <ul className="mt-1 flex list-none flex-wrap gap-1 p-0" aria-label="Attachments">
              {attachments.map((file) => (
                <li key={file.id} className={cn(chatAttachmentChipBase)}>
                  {file.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {entries.length > 0 || onReactionToggle ? (
          <div className={cn(chatReactionsBase, variant === 'user' && 'flex-row-reverse')}>
            {plainEntries.map(([icon, count]) => (
              <ChatMessageReaction
                key={icon}
                icon={reactionIcon(icon)}
                label={reactionLabel(icon)}
                count={count}
                active={activeReactions.includes(icon)}
                onToggle={onReactionToggle ? () => onReactionToggle(icon) : undefined}
              />
            ))}
            {onReactionToggle ? <ReactionEmoji onSelect={onReactionToggle} /> : null}
            {onReactionToggle ? <ReactionRate counts={reactions ?? {}} active={activeReactions} onToggle={onReactionToggle} /> : null}
          </div>
        ) : null}
      </div>
    </ark.div>
  );
}
