<!-- libs/vortex-svelte/src/chat/ChatMessageReaction.svelte -->
<!-- Single reaction pill. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { chatReactionPillBase, cn } from '@cloudvoyant/vortex-ui';

  type Props = {
    icon: Snippet | string;
    label?: string;
    count?: number;
    active?: boolean;
    onToggle?: () => void;
    class?: string;
  };

  let { icon, label, count = 0, active = false, onToggle, class: className = '' }: Props = $props();
</script>

<button
  type="button"
  aria-pressed={active}
  aria-label={label ?? 'Reaction'}
  title={label}
  class={cn(chatReactionPillBase, className)}
  onclick={onToggle}
>
  {#if typeof icon === 'string'}{icon}{:else}{@render icon()}{/if}
  {#if count > 0}<span>{count}</span>{/if}
</button>
