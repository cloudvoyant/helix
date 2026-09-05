<!-- Closely based on: shadcn AI Elements Conversation with TanStack Virtual, mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import {
    chatThreadBase,
    chatVirtualContentBase,
    chatVirtualItemBase,
    type ChatMessageData,
    type ChatVariant,
  } from '@cloudvoyant/vortex-ui';
  import { get } from 'svelte/store';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import Chat from './Chat.svelte';
  import ChatMessage from './ChatMessage.svelte';

  type Props = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
    messages: ChatMessageData[];
    variant?: ChatVariant;
    estimateSize?: number;
    overscan?: number;
    topThreshold?: number;
    followOutput?: boolean;
    onScrollTop?: () => void | Promise<void>;
    renderMessage?: Snippet<[ChatMessageData]>;
    children?: Snippet;
  };
  let {
    messages,
    variant = 'minimal',
    estimateSize = 96,
    overscan = 6,
    topThreshold = 32,
    followOutput = true,
    onScrollTop,
    renderMessage,
    children,
    class: className = '',
    ...rest
  }: Props = $props();
  let scrollElement = $state<HTMLDivElement>();
  let insideThreshold = false;
  let shouldFollow = true;
  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: messages.length,
    getScrollElement: () => scrollElement ?? null,
    estimateSize: () => estimateSize,
    getItemKey: (index) => messages[index]?.id ?? index,
    overscan,
  });

  $effect(() => {
    const instance = get(virtualizer);
    instance.setOptions({
      ...instance.options,
      count: messages.length,
      getScrollElement: () => scrollElement ?? null,
      estimateSize: () => estimateSize,
      getItemKey: (index) => messages[index]?.id ?? index,
      overscan,
    });
  });

  $effect(() => {
    if (followOutput && shouldFollow && messages.length > 0) {
      get(virtualizer).scrollToIndex(messages.length - 1, { align: 'end' });
    }
  });

  function measureElement(node: HTMLDivElement) {
    get(virtualizer).measureElement(node);
  }
</script>

<Chat {variant} class={className} {...rest}>
  <div
    bind:this={scrollElement}
    data-agentic-thread
    class={chatThreadBase}
    onscroll={(event) => {
      const node = event.currentTarget;
      const atTop = node.scrollTop <= topThreshold;
      if (atTop && !insideThreshold) void onScrollTop?.();
      insideThreshold = atTop;
      shouldFollow = node.scrollHeight - node.scrollTop - node.clientHeight <= 64;
    }}
  >
    <div class={chatVirtualContentBase} style:height={`${$virtualizer.getTotalSize()}px`}>
      {#each messages.length === 0 ? [] : $virtualizer.getVirtualItems() as item (item.key)}
        {@const message = messages[item.index]}
        <div
          data-index={item.index}
          use:measureElement
          class={chatVirtualItemBase}
          style:transform={`translateY(${item.start}px)`}
        >
          {#if renderMessage}{@render renderMessage(message)}{:else}<ChatMessage {...message} />{/if}
        </div>
      {/each}
    </div>
  </div>
  {@render children?.()}
</Chat>
