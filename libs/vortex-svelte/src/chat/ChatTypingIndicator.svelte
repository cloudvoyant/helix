<!-- Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { chatTypingBase, cn } from '@cloudvoyant/vortex-ui';
  import { CircleNotchIcon } from 'phosphor-svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & { label?: string };
  let { label = 'Someone is typing', class: className = '', ...rest }: Props = $props();
</script>

<div class={cn(chatTypingBase, className)} role="status" aria-live="polite" {...rest}>
  <span>{label}</span>
  <CircleNotchIcon aria-hidden="true" class="animate-spin" size={16} />
</div>
