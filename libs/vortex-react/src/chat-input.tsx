// libs/vortex-react/src/chat-input.tsx
// Chat composer: multiline input with Enter-to-send (Shift+Enter newline),
// IME guard, attachment chips, and a send trigger. Composed from the repo's
// Textarea (Ark UI field) and buttonVariants; icons are Phosphor Icons
// (@phosphor-icons/react).
import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  buttonVariants,
  chatAttachmentChipBase,
  chatComposerBase,
  chatComposerRowBase,
  cn,
  type ChatAttachment,
} from '@cloudvoyant/vortex-ui';
import { PaperclipIcon, PaperPlaneRightIcon, XIcon } from '@phosphor-icons/react';
import { Textarea } from './textarea';

export interface ChatInputProps {
  placeholder?: string;
  /** Controlled value. Omit for uncontrolled usage. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text and pending attachments; both reset after sending. */
  onSend?: (text: string, attachments: ChatAttachment[]) => void;
  disabled?: boolean;
  className?: string;
  /** Accessible label for the attachment trigger. Default `Attach files`. */
  attachLabel?: string;
  /** Accessible label for the send trigger. Default `Send message`. */
  sendLabel?: string;
}

/** Message composer with attachments. Enter sends; Shift+Enter inserts a newline. */
export function ChatInput({
  placeholder = 'Write a message…',
  value,
  onValueChange,
  onSend,
  disabled = false,
  className,
  attachLabel = 'Attach files',
  sendLabel = 'Send message',
}: ChatInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const text = value ?? uncontrolled;

  const setText = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  const send = () => {
    const trimmed = text.trim();
    if (disabled || (trimmed === '' && attachments.length === 0)) return;
    onSend?.(trimmed, attachments);
    setAttachments([]);
    setText('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).map(
      (file): ChatAttachment => ({ id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name }),
    );
    if (picked.length > 0) setAttachments((current) => [...current, ...picked]);
    event.target.value = '';
  };

  return (
    <div className={cn(chatComposerBase, className)}>
      {attachments.length > 0 ? (
        <ul className="flex list-none flex-wrap gap-1 p-0" aria-label="Pending attachments">
          {attachments.map((file) => (
            <li key={file.id} className={cn(chatAttachmentChipBase)}>
              {file.name}
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                className="ml-0.5 rounded-sm hover:text-foreground"
                onClick={() => setAttachments((current) => current.filter((a) => a.id !== file.id))}
              >
                <XIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={cn(chatComposerRowBase)}>
        <button
          type="button"
          aria-label={attachLabel}
          disabled={disabled}
          className={cn(buttonVariants({ variant: 'text' }), 'size-8 shrink-0 p-0 text-muted-foreground')}
          onClick={() => fileRef.current?.click()}
        >
          <PaperclipIcon />
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles} />
        <Textarea
          rows={1}
          aria-label={placeholder}
          placeholder={placeholder}
          value={text}
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-32 min-h-8 resize-none py-1.5"
        />
        <button
          type="button"
          aria-label={sendLabel}
          disabled={disabled}
          className={cn(buttonVariants({ variant: 'text', color: 'primary' }), 'size-8 shrink-0 p-0')}
          onClick={send}
        >
          <PaperPlaneRightIcon />
        </button>
      </div>
    </div>
  );
}
