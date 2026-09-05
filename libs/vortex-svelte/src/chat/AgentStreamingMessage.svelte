<!-- libs/vortex-svelte/src/chat/AgentStreamingMessage.svelte -->
<!-- Streaming tail: pending text with a caret, or the typing indicator while
     waiting. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { chatBubbleVariants, chatCaretBase, chatRowVariants, cn } from '@cloudvoyant/vortex-ui';
  import { useChatContext } from './context';
  import { useAgentChatContext } from './agent-context';
  import TypingIndicator from './TypingIndicator.svelte';

  type Props = { text?: string; streaming?: boolean; class?: string };
  let { text, streaming, class: className = '' }: Props = $props();

  const chat = useChatContext();
  const agent = useAgentChatContext();
  const threadVariant = $derived(agent?.threadVariant ?? chat.threadVariant);
  const current = $derived(text ?? agent?.chat.state.pending ?? '');
  const active = $derived(
    streaming ?? (agent ? ['waiting', 'streaming', 'retrying'].includes(agent.chat.state.status) : false),
  );
</script>

{#if active || current !== ''}
  <div aria-live="polite" class={cn(chatRowVariants({ variant: threadVariant, role: 'agent' }), className)}>
    {#if current === ''}
      <TypingIndicator />
    {:else}
      <div class={chatBubbleVariants({ variant: threadVariant, role: 'agent' })}>
        {current}
        {#if active}<span aria-hidden="true" class={chatCaretBase}></span>{/if}
      </div>
    {/if}
  </div>
{/if}
