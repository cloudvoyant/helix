<!-- Closely based on: shadcn AI Elements Message, mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import {
    chatAttachmentBase,
    chatAttachmentListBase,
    chatMessageBodyBase,
    chatMessageMetaBase,
    chatMessageStatusBase,
    chatMessageSurfaceVariants,
    chatMessageVariants,
    chatReactionListBase,
    cn,
    formatChatTimestamp,
    renderChatMarkdown,
    type ChatAttachment,
    type ChatMessageFormat,
    type ChatMessageRole,
    type ChatMessageStatus,
    type ChatReaction,
  } from '@cloudvoyant/vortex-ui';
  import { FileIcon } from 'phosphor-svelte';
  import { getContext, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import ChatMessageReaction from './ChatMessageReaction.svelte';
  import { CHAT_CONTEXT, type ChatContextValue } from './context.svelte';

  type Props = Omit<HTMLAttributes<HTMLElement>, 'id' | 'role'> & {
    id: string;
    role?: ChatMessageRole;
    from?: string;
    at?: Date | string;
    status?: ChatMessageStatus;
    format?: ChatMessageFormat;
    content?: string;
    attachments?: ChatAttachment[];
    reactions?: ChatReaction[];
    attachmentIcon?: Snippet;
    onReactionChange?: (key: string, pressed: boolean) => void;
    children?: Snippet;
  };
  let {
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
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  const context = getContext<ChatContextValue | undefined>(CHAT_CONTEXT);
  const layout = $derived(context?.variant ?? 'slack');
  const resolvedFormat = $derived(format ?? (role === 'agent' ? 'markdown' : 'text'));
  const markdown = $derived(resolvedFormat === 'markdown' ? renderChatMarkdown(content) : null);
</script>

<article
  data-chat-message={id}
  data-role={role}
  data-status={status}
  class={cn(chatMessageVariants({ role, layout }), className)}
  {...rest}
>
  <div data-chat-message-surface class={chatMessageSurfaceVariants({ role, layout })}>
    {#if from || at}
      <div class={chatMessageMetaBase}>
        {#if from}<strong>{from}</strong>{/if}
        {#if at}<time datetime={at instanceof Date ? at.toISOString() : at}>{formatChatTimestamp(at)}</time>{/if}
      </div>
    {/if}
    {#if children}
      <div class={chatMessageBodyBase}>{@render children()}</div>
    {:else if markdown !== null}
      <div class={chatMessageBodyBase}>{@html markdown}</div>
    {:else}
      <div class={chatMessageBodyBase}>{content}</div>
    {/if}
    {#if attachments.length > 0}
      <div class={chatAttachmentListBase} aria-label="Attachments">
        {#each attachments as attachment (attachment.id)}
          {#if attachment.url}
            <a class={chatAttachmentBase} href={attachment.url} download={attachment.name}>
              {#if attachmentIcon}{@render attachmentIcon()}{:else}<FileIcon aria-hidden="true" size={16} />{/if}
              <span>{attachment.name}</span>
            </a>
          {:else}
            <span class={chatAttachmentBase}>
              {#if attachmentIcon}{@render attachmentIcon()}{:else}<FileIcon aria-hidden="true" size={16} />{/if}
              <span>{attachment.name}</span>
            </span>
          {/if}
        {/each}
      </div>
    {/if}
    {#if reactions.length > 0}
      <div class={chatReactionListBase} aria-label="Message reactions">
        {#each reactions as reaction (reaction.key)}
          <ChatMessageReaction {reaction} onPressedChange={(value) => onReactionChange?.(reaction.key, value)} />
        {/each}
      </div>
    {/if}
    {#if status && status !== 'completed'}<div class={chatMessageStatusBase} role="status">{status}</div>{/if}
  </div>
</article>
