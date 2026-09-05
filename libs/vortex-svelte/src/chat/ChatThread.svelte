<!-- libs/vortex-svelte/src/chat/ChatThread.svelte -->
<!-- Message list with its own native scroll container. Mirrored from
     @cloudvoyant/vortex-react. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { chatThreadVariants, cn, type ChatMessageData, type ChatThreadVariant } from '@cloudvoyant/vortex-ui';
  import ChatMessage from './ChatMessage.svelte';
  import VirtualList from './VirtualList.svelte';

  type Props = {
    variant?: ChatThreadVariant;
    messages?: ChatMessageData[];
    virtual?: boolean;
    estimateSize?: () => number;
    onScrollTop?: () => void;
    children?: Snippet;
    class?: string;
  };

  let {
    variant = 'slack',
    messages,
    virtual = false,
    estimateSize = () => 64,
    onScrollTop,
    children,
    class: className = '',
  }: Props = $props();

  let scrollEl: HTMLDivElement | undefined = $state();
  let atTop = false;

  function handleScroll(event: Event) {
    if (!onScrollTop) return;
    const el = event.currentTarget as HTMLElement;
    if (el.scrollTop <= 16) {
      if (!atTop) {
        atTop = true;
        onScrollTop();
      }
    } else if (el.scrollTop > 48) {
      atTop = false;
    }
  }
</script>

{#snippet row(message: ChatMessageData)}
  <ChatMessage
    variant={message.variant}
    from={message.from}
    at={message.at}
    reactions={message.reactions}
    attachments={message.attachments}
  >
    {message.content}
  </ChatMessage>
{/snippet}

<div bind:this={scrollEl} onscroll={handleScroll} class={cn(chatThreadVariants({ variant }), className)}>
  {#if messages}
    {#if virtual && scrollEl}
      <VirtualList {messages} {scrollEl} {estimateSize} />
    {:else}
      {#each messages as message (message.id)}
        {@render row(message)}
      {/each}
    {/if}
  {:else}
    {@render children?.()}
  {/if}
</div>
