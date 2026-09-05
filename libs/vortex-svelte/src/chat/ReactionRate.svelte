<!-- libs/vortex-svelte/src/chat/ReactionRate.svelte -->
<!-- Thumbs up/down rating pair. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { THUMBS_DOWN, THUMBS_UP, chatReactionsBase, cn, type ChatReactions } from '@cloudvoyant/vortex-ui';
  import { ThumbsDown, ThumbsUp } from 'phosphor-svelte';
  import ChatMessageReaction from './ChatMessageReaction.svelte';

  type Props = {
    counts: ChatReactions;
    active?: string[];
    onToggle: (icon: string) => void;
    class?: string;
  };

  let { counts, active = [], onToggle, class: className = '' }: Props = $props();
</script>

<span class={cn(chatReactionsBase, className)}>
  {#snippet thumbsUp()}<ThumbsUp />{/snippet}
  {#snippet thumbsDown()}<ThumbsDown />{/snippet}
  <ChatMessageReaction
    icon={thumbsUp}
    label="Thumbs up"
    count={counts[THUMBS_UP] ?? 0}
    active={active.includes(THUMBS_UP)}
    onToggle={() => onToggle(THUMBS_UP)}
  />
  <ChatMessageReaction
    icon={thumbsDown}
    label="Thumbs down"
    count={counts[THUMBS_DOWN] ?? 0}
    active={active.includes(THUMBS_DOWN)}
    onToggle={() => onToggle(THUMBS_DOWN)}
  />
</span>
