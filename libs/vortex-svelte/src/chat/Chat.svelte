<!-- libs/vortex-svelte/src/chat/Chat.svelte -->
<!-- Presentational chat root. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn, type ChatVariant } from '@cloudvoyant/vortex-ui';
  import { provideChatContext } from './context';

  type Props = { variant?: ChatVariant; class?: string; children?: Snippet };
  let { variant = 'slack', class: className = '', children }: Props = $props();

  provideChatContext({
    get threadVariant() {
      return variant;
    },
  });
</script>

<div class={cn('flex h-full min-h-0 flex-col', className)}>
  {@render children?.()}
</div>
