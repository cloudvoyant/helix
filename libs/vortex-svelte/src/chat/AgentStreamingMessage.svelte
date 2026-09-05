<!-- Closely based on: shadcn AI Elements Message Response, mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import {
    agentStreamingMessageBase,
    chatMessageBodyBase,
    cn,
    renderChatMarkdown,
    type AgenticChatStreamingState,
  } from '@cloudvoyant/vortex-ui';
  import { ArrowClockwiseIcon, CheckCircleIcon, CircleNotchIcon, StopIcon } from 'phosphor-svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    content?: string;
    state: AgenticChatStreamingState;
    icon?: Snippet;
  };
  let { content = '', state, icon, class: className = '', ...rest }: Props = $props();
  const label = $derived(
    state === 'waiting'
      ? 'Agent is waiting'
      : state === 'retrying'
        ? 'Agent is retrying'
        : state === 'cancelled'
          ? 'Agent response cancelled'
          : state === 'completed'
            ? 'Agent response completed'
            : 'Agent response streaming',
  );
  const markdown = $derived(renderChatMarkdown(content));
</script>

{#if state !== 'idle' && (state !== 'completed' || content)}
  <div
    data-agent-streaming={state}
    class={cn(agentStreamingMessageBase, className)}
    role="status"
    aria-live="polite"
    {...rest}
  >
    <span class="sr-only">{label}</span>
    <span class="mb-1 inline-flex" aria-hidden="true">
      {#if icon}
        {@render icon()}
      {:else if state === 'retrying'}
        <ArrowClockwiseIcon size={16} />
      {:else if state === 'cancelled'}
        <StopIcon size={16} />
      {:else if state === 'completed'}
        <CheckCircleIcon size={16} />
      {:else}
        <CircleNotchIcon class="animate-spin" size={16} />
      {/if}
    </span>
    {#if content}<div class={chatMessageBodyBase}>{@html markdown}</div>{/if}
  </div>
{/if}
