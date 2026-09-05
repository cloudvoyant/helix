<!-- libs/vortex-svelte/src/chat/TypingIndicator.svelte -->
<!-- Animated three-dot typing indicator. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { chatTypingBase, chatTypingDotBase, cn } from '@cloudvoyant/vortex-ui';

  type Props = { label?: string; class?: string };
  let { label = 'typing…', class: className = '' }: Props = $props();

  const delays = [0, 150, 300];
</script>

<span role="status" class={cn(chatTypingBase, className)}>
  <span class="sr-only">{label}</span>
  <span aria-hidden="true" class={chatTypingBase}>
    {#each delays as delay (delay)}
      <span class={chatTypingDotBase} style="animation-delay: {delay}ms"></span>
    {/each}
  </span>
</span>
