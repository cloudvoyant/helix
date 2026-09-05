<!-- Closely based on: shadcn AI Elements Conversation, mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { Ark } from '@ark-ui/svelte/factory';
  import { chatThreadBase, chatThreadContentBase, cn } from '@cloudvoyant/vortex-ui';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    contentClass?: string;
    topThreshold?: number;
    onScrollTop?: () => void | Promise<void>;
    children?: Snippet;
  };
  let {
    class: className = '',
    contentClass = '',
    topThreshold = 32,
    onScrollTop,
    children,
    onscroll,
    ...rest
  }: Props = $props();
  let insideThreshold = false;
</script>

<Ark
  as="div"
  data-chat-thread
  class={cn(chatThreadBase, className)}
  onscroll={(event) => {
    onscroll?.(event);
    const atTop = event.currentTarget.scrollTop <= topThreshold;
    if (atTop && !insideThreshold) void onScrollTop?.();
    insideThreshold = atTop;
  }}
  {...rest}
>
  <div class={cn(chatThreadContentBase, contentClass)}>{@render children?.()}</div>
</Ark>
