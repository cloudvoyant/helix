<!-- libs/vortex-svelte/src/chat/AgentChat.svelte -->
<!-- Agentic chat root. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn, type ChatThreadVariant } from '@cloudvoyant/vortex-ui';
  import { provideAgentChatContext } from './agent-context';
  import type { AgenticChatController } from './use-agentic-chat.svelte';

  type Props = {
    chat: AgenticChatController;
    threadVariant?: ChatThreadVariant;
    class?: string;
    children?: Snippet;
  };
  let { chat, threadVariant = 'minimal', class: className = '', children }: Props = $props();

  provideAgentChatContext({
    get chat() {
      return chat;
    },
    get threadVariant() {
      return threadVariant;
    },
  });
</script>

<div class={cn('flex h-full min-h-0 flex-col', className)}>
  {@render children?.()}
</div>
