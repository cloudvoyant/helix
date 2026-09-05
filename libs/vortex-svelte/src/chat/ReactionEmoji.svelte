<!-- libs/vortex-svelte/src/chat/ReactionEmoji.svelte -->
<!-- iOS-style emoji reaction menu in a popover. Mirrored from
     @cloudvoyant/vortex-react. -->
<script lang="ts">
  import {
    DEFAULT_REACTION_EMOJIS,
    chatReactionGridBase,
    chatReactionGridItemBase,
    chatReactionMenuTriggerBase,
    cn,
  } from '@cloudvoyant/vortex-ui';
  import { Popover, PopoverTrigger, PopoverContent } from '../popover';
  import { Smiley } from 'phosphor-svelte';

  type Props = {
    emojis?: readonly string[];
    onSelect: (emoji: string) => void;
    label?: string;
    class?: string;
  };

  let { emojis = DEFAULT_REACTION_EMOJIS, onSelect, label = 'Add reaction', class: className = '' }: Props = $props();

  let open = $state(false);
</script>

<Popover open={open} onOpenChange={(details) => (open = details.open)}>
  <PopoverTrigger aria-label={label} class={cn(chatReactionMenuTriggerBase, className)}>
    <Smiley />
  </PopoverTrigger>
  <PopoverContent class="p-2">
    <div aria-label="Choose a reaction" class={chatReactionGridBase}>
      {#each emojis as emoji (emoji)}
        <button
          type="button"
          aria-label="React {emoji}"
          class={chatReactionGridItemBase}
          onclick={() => {
            open = false;
            onSelect(emoji);
          }}
        >
          {emoji}
        </button>
      {/each}
    </div>
  </PopoverContent>
</Popover>
