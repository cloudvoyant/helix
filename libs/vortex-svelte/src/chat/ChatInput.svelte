<!-- libs/vortex-svelte/src/chat/ChatInput.svelte -->
<!-- Message composer with attachments. Mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import {
    buttonVariants,
    chatAttachmentChipBase,
    chatComposerBase,
    chatComposerRowBase,
    cn,
    type ChatAttachment,
  } from '@cloudvoyant/vortex-ui';
  import { Paperclip, PaperPlaneRight, X } from 'phosphor-svelte';
  import Textarea from '../Textarea.svelte';

  type Props = {
    placeholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    onSend?: (text: string, attachments: ChatAttachment[]) => void;
    disabled?: boolean;
    class?: string;
    attachLabel?: string;
    sendLabel?: string;
  };

  let {
    placeholder = 'Write a message…',
    value,
    onValueChange,
    onSend,
    disabled = false,
    class: className = '',
    attachLabel = 'Attach files',
    sendLabel = 'Send message',
  }: Props = $props();

  let uncontrolled = $state('');
  let attachments = $state<ChatAttachment[]>([]);
  let fileInput: HTMLInputElement | undefined = $state();

  const text = $derived(value ?? uncontrolled);

  function setText(next: string) {
    uncontrolled = next;
    onValueChange?.(next);
  }

  function send() {
    const trimmed = text.trim();
    if (disabled || (trimmed === '' && attachments.length === 0)) return;
    onSend?.(trimmed, attachments);
    attachments = [];
    setText('');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      send();
    }
  }

  function handleFiles(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const picked = Array.from(input.files ?? []).map(
      (file): ChatAttachment => ({ id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name }),
    );
    if (picked.length > 0) attachments = [...attachments, ...picked];
    input.value = '';
  }
</script>

<div class={cn(chatComposerBase, className)}>
  {#if attachments.length > 0}
    <ul class="flex list-none flex-wrap gap-1 p-0" aria-label="Pending attachments">
      {#each attachments as file (file.id)}
        <li class={chatAttachmentChipBase}>
          {file.name}
          <button
            type="button"
            aria-label="Remove {file.name}"
            class="ml-0.5 rounded-sm hover:text-foreground"
            onclick={() => (attachments = attachments.filter((a) => a.id !== file.id))}
          >
            <X />
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  <div class={chatComposerRowBase}>
    <button
      type="button"
      aria-label={attachLabel}
      {disabled}
      class={cn(buttonVariants({ variant: 'text' }), 'size-8 shrink-0 p-0 text-muted-foreground')}
      onclick={() => fileInput?.click()}
    >
      <Paperclip />
    </button>
    <input bind:this={fileInput} type="file" multiple class="hidden" onchange={handleFiles} />
    <Textarea
      rows={1}
      aria-label={placeholder}
      {placeholder}
      value={text}
      {disabled}
      oninput={(event) => setText(event.currentTarget.value)}
      onkeydown={handleKeydown}
      class="max-h-32 min-h-8 resize-none py-1.5"
    />
    <button
      type="button"
      aria-label={sendLabel}
      {disabled}
      class={cn(buttonVariants({ variant: 'text', color: 'primary' }), 'size-8 shrink-0 p-0')}
      onclick={send}
    >
      <PaperPlaneRight />
    </button>
  </div>
</div>
