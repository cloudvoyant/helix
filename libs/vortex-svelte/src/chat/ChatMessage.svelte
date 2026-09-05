<!-- libs/vortex-svelte/src/chat/ChatMessage.svelte -->
<!-- One chat message: meta row, bubble, attachments, reactions. Mirrored from
     @cloudvoyant/vortex-react. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    THUMBS_DOWN,
    THUMBS_UP,
    chatAttachmentChipBase,
    chatBubbleVariants,
    chatCaretBase,
    chatMetaBase,
    chatReactionsBase,
    chatRowVariants,
    cn,
    type ChatAttachment,
    type ChatMessageStatus,
    type ChatMessageVariant,
    type ChatReactions,
  } from '@cloudvoyant/vortex-ui';
  import { useChatContext } from './context';
  import ChatMessageReaction from './ChatMessageReaction.svelte';
  import ReactionEmoji from './ReactionEmoji.svelte';
  import ReactionRate from './ReactionRate.svelte';

  type Props = {
    variant?: ChatMessageVariant;
    status?: ChatMessageStatus;
    from?: string;
    at?: Date;
    reactions?: ChatReactions;
    activeReactions?: string[];
    attachments?: ChatAttachment[];
    onReactionToggle?: (icon: string) => void;
    children?: Snippet;
    class?: string;
  };

  let {
    variant = 'default',
    status,
    from,
    at,
    reactions,
    activeReactions = [],
    attachments,
    onReactionToggle,
    children,
    class: className = '',
  }: Props = $props();

  const chat = useChatContext();
  const threadVariant = $derived(chat.threadVariant);
  const showMeta = $derived(threadVariant !== 'minimal' && (from !== undefined || at !== undefined));
  const entries = $derived(Object.entries(reactions ?? {}));
  const plainEntries = $derived(
    onReactionToggle ? entries.filter(([icon]) => icon !== THUMBS_UP && icon !== THUMBS_DOWN) : entries,
  );
  const time = $derived(at ? at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '');

  function labelFor(icon: string): string {
    if (icon === THUMBS_UP) return 'Thumbs up';
    if (icon === THUMBS_DOWN) return 'Thumbs down';
    return `React ${icon}`;
  }
</script>

<div class={cn(chatRowVariants({ variant: threadVariant, role: variant }), className)}>
  <div class="flex max-w-full flex-col gap-1">
    {#if showMeta}
      <div class={cn(chatMetaBase, variant === 'user' && 'flex-row-reverse')}>
        {#if from}<span class="font-medium text-foreground">{from}</span>{/if}
        {#if at}<time datetime={at.toISOString()}>{time}</time>{/if}
      </div>
    {/if}
    <div
      class={cn(
        chatBubbleVariants({ variant: threadVariant, role: variant }),
        status === 'sending' && 'opacity-60',
        status === 'error' && 'border-destructive/60 text-destructive',
      )}
    >
      {@render children?.()}
      {#if status === 'streaming'}<span aria-hidden="true" class={chatCaretBase}></span>{/if}
      {#if attachments && attachments.length > 0}
        <ul class="mt-1 flex list-none flex-wrap gap-1 p-0" aria-label="Attachments">
          {#each attachments as file (file.id)}
            <li class={chatAttachmentChipBase}>{file.name}</li>
          {/each}
        </ul>
      {/if}
    </div>
    {#if entries.length > 0 || onReactionToggle}
      <div class={cn(chatReactionsBase, variant === 'user' && 'flex-row-reverse')}>
        {#each plainEntries as [icon, count] (icon)}
          <ChatMessageReaction
            icon={icon}
            label={labelFor(icon)}
            {count}
            active={activeReactions.includes(icon)}
            onToggle={onReactionToggle ? () => onReactionToggle(icon) : undefined}
          />
        {/each}
        {#if onReactionToggle}<ReactionEmoji onSelect={onReactionToggle} />{/if}
        {#if onReactionToggle}
          <ReactionRate counts={reactions ?? {}} active={activeReactions} onToggle={onReactionToggle} />
        {/if}
      </div>
    {/if}
  </div>
</div>
