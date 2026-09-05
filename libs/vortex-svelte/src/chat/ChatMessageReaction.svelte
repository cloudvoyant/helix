<!-- Closely based on: shadcn AI Elements Message Actions, mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { chatReactionBase, cn, type ChatReaction, type ChatReactionVariant } from '@cloudvoyant/vortex-ui';
  import { ThumbsDownIcon, ThumbsUpIcon } from 'phosphor-svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Props = Omit<HTMLButtonAttributes, 'value'> & {
    reaction: ChatReaction;
    variant?: ChatReactionVariant;
    pressed?: boolean;
    defaultPressed?: boolean;
    icon?: Snippet;
    onPressedChange?: (pressed: boolean) => void;
  };
  let {
    reaction,
    variant = reaction.variant ?? 'emoji',
    pressed,
    defaultPressed = reaction.reacted ?? false,
    icon,
    onPressedChange,
    class: className = '',
    onclick,
    ...rest
  }: Props = $props();
  let internalPressed = $state(defaultPressed);
  const active = $derived(pressed ?? internalPressed);
  const count = $derived(
    Math.max(0, reaction.count + (active === Boolean(reaction.reacted) ? 0 : active ? 1 : -1)),
  );
</script>

<button
  type="button"
  aria-label={reaction.label}
  aria-pressed={active}
  data-pressed={active}
  data-variant={variant}
  class={cn(chatReactionBase, className)}
  onclick={(event) => {
    onclick?.(event);
    if (event.defaultPrevented) return;
    const next = !active;
    if (pressed === undefined) internalPressed = next;
    onPressedChange?.(next);
  }}
  {...rest}
>
  {#if icon}
    {@render icon()}
  {:else if variant === 'rate' && reaction.icon === 'thumbs-down'}
    <ThumbsDownIcon aria-hidden="true" size={16} weight={active ? 'fill' : 'regular'} />
  {:else if variant === 'rate'}
    <ThumbsUpIcon aria-hidden="true" size={16} weight={active ? 'fill' : 'regular'} />
  {:else}
    <span aria-hidden="true">{reaction.value}</span>
  {/if}
  <span>{count}</span>
</button>
