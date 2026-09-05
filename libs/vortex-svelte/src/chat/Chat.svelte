<!-- Closely based on: shadcn AI Elements Conversation, mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import { Ark } from '@ark-ui/svelte/factory';
  import { chatVariants, cn, type ChatVariant } from '@cloudvoyant/vortex-ui';
  import { setContext, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { CHAT_CONTEXT, type ChatContextValue } from './context.svelte';

  type Props = HTMLAttributes<HTMLElement> & { variant?: ChatVariant; children?: Snippet };
  let { variant = 'slack', class: className = '', children, ...rest }: Props = $props();
  setContext<ChatContextValue>(CHAT_CONTEXT, {
    get variant() {
      return variant;
    },
  });
  const classes = $derived(cn(chatVariants({ variant }), className));
</script>

<Ark as="section" data-chat data-variant={variant} class={classes} {...rest}>
  {@render children?.()}
</Ark>
