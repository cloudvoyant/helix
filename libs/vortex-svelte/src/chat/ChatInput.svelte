<!-- Closely based on: shadcn AI Elements Prompt Input, mirrored from @cloudvoyant/vortex-react. -->
<script lang="ts">
  import {
    chatInputActionBase,
    chatInputAttachmentBase,
    chatInputComposerBase,
    chatInputRootBase,
    chatInputSendBase,
    chatInputTextareaBase,
    cn,
    createChatAttachment,
    type ChatAttachment,
    type ChatSendPayload,
  } from '@cloudvoyant/vortex-ui';
  import { ArrowUpIcon, PaperclipIcon, XIcon } from 'phosphor-svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = Omit<HTMLAttributes<HTMLFormElement>, 'onsubmit'> & {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    sendLabel?: string;
    attachLabel?: string;
    attachIcon?: Snippet;
    sendIcon?: Snippet;
    removeIcon?: Snippet;
    onValueChange?: (value: string) => void;
    onSend: (payload: ChatSendPayload) => void | Promise<void>;
  };
  let {
    value,
    defaultValue = '',
    placeholder = 'Message',
    accept,
    multiple = true,
    disabled = false,
    sendLabel = 'Send message',
    attachLabel = 'Attach files',
    attachIcon,
    sendIcon,
    removeIcon,
    onValueChange,
    onSend,
    class: className = '',
    ...rest
  }: Props = $props();
  let internalValue = $state(defaultValue);
  let attachments = $state<ChatAttachment[]>([]);
  let sending = $state(false);
  let composing = false;
  let fileInput: HTMLInputElement;
  const text = $derived(value ?? internalValue);

  function setText(next: string) {
    if (value === undefined) internalValue = next;
    onValueChange?.(next);
  }

  async function submit() {
    if (disabled || sending || (!text.trim() && attachments.length === 0)) return;
    sending = true;
    try {
      await onSend({ text: text.trim(), attachments });
      setText('');
      attachments = [];
      if (fileInput) fileInput.value = '';
    } finally {
      sending = false;
    }
  }

  function chooseFiles(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const next = Array.from(input.files ?? []).map((file) => createChatAttachment(file));
    attachments = [
      ...attachments,
      ...next.filter((item) => !attachments.some((existing) => existing.id === item.id)),
    ];
  }
</script>

<form
  data-chat-input
  class={cn(chatInputRootBase, className)}
  onsubmit={(event) => {
    event.preventDefault();
    void submit();
  }}
  {...rest}
>
  {#if attachments.length > 0}
    <div class="mb-2 flex flex-wrap gap-2" aria-label="Selected attachments">
      {#each attachments as attachment (attachment.id)}
        <span class={chatInputAttachmentBase}>
          {attachment.name}<button
            type="button"
            aria-label={`Remove ${attachment.name}`}
            onclick={() => {
              attachments = attachments.filter((item) => item.id !== attachment.id);
            }}
          >{#if removeIcon}{@render removeIcon()}{:else}<XIcon aria-hidden="true" size={14} />{/if}</button>
        </span>
      {/each}
    </div>
  {/if}
  <div class={chatInputComposerBase}>
    <input
      bind:this={fileInput}
      class="sr-only"
      type="file"
      tabindex="-1"
      {accept}
      {multiple}
      disabled={disabled || sending}
      onchange={chooseFiles}
    />
    <button
      type="button"
      class={chatInputActionBase}
      aria-label={attachLabel}
      disabled={disabled || sending}
      onclick={() => fileInput?.click()}
    >{#if attachIcon}{@render attachIcon()}{:else}<PaperclipIcon aria-hidden="true" size={18} />{/if}</button>
    <textarea
      class={chatInputTextareaBase}
      value={text}
      {placeholder}
      disabled={disabled || sending}
      rows="1"
      oninput={(event) => setText(event.currentTarget.value)}
      oncompositionstart={() => {
        composing = true;
      }}
      oncompositionend={() => {
        composing = false;
      }}
      onkeydown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && !composing) {
          event.preventDefault();
          void submit();
        }
      }}
    ></textarea>
    <button
      type="submit"
      class={cn(chatInputActionBase, chatInputSendBase)}
      aria-label={sendLabel}
      disabled={disabled || sending || (!text.trim() && attachments.length === 0)}
    >{#if sendIcon}{@render sendIcon()}{:else}<ArrowUpIcon aria-hidden="true" size={18} weight="bold" />{/if}</button>
  </div>
</form>
