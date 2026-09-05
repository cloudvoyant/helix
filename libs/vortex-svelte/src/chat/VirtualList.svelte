<!-- libs/vortex-svelte/src/chat/VirtualList.svelte -->
<!-- Optional virtualization over @tanstack/svelte-virtual (optional peer
     dependency, dynamic import). Renders the full list until the module
     resolves. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { ChatMessageData } from '@cloudvoyant/vortex-ui';
  import type { VirtualItem } from '@tanstack/svelte-virtual';
  import ChatMessage from './ChatMessage.svelte';

  type Props = {
    messages: ChatMessageData[];
    scrollEl: HTMLElement;
    estimateSize?: () => number;
  };
  let { messages, scrollEl, estimateSize = () => 64 }: Props = $props();

  type Snapshot = { items: VirtualItem[]; totalSize: number };

  let snapshot: Snapshot | null = $state(null);
  let measure: ((el: Element) => void) | undefined;
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    import('@tanstack/svelte-virtual').then((m) => {
      const store = m.createVirtualizer({
        count: messages.length,
        getScrollElement: () => scrollEl,
        estimateSize,
        overscan: 8,
      });
      unsubscribe = store.subscribe((virtualizer) => {
        snapshot = {
          items: virtualizer.getVirtualItems(),
          totalSize: virtualizer.getTotalSize(),
        };
        measure = (el) => virtualizer.measureElement(el);
      });
    });
    return () => unsubscribe?.();
  });

  /** Svelte action form of the TanStack `measureElement` ref. */
  function measureRef(el: Element) {
    measure?.(el);
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

{#if snapshot}
  <div style="height: {snapshot.totalSize}px; position: relative; width: 100%">
    {#each snapshot.items as virtualItem (virtualItem.index)}
      <div
        data-index={virtualItem.index}
        use:measureRef
        style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualItem.start}px)"
      >
        {@render row(messages[virtualItem.index])}
      </div>
    {/each}
  </div>
{:else}
  {#each messages as message (message.id)}
    {@render row(message)}
  {/each}
{/if}
