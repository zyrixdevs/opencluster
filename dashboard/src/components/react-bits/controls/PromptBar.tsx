import { ArrowUp, Paperclip } from "lucide-react";
import { type FormEvent, type TextareaHTMLAttributes, useState } from "react";

export interface PromptBarProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onSubmit"> {
  onSend: (prompt: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  attachments?: boolean;
}

/** A local prompt composer. It sends text to the caller and has no AI service. */
export function PromptBar({
  onSend,
  placeholder = "Ask about your cluster...",
  disabled = false,
  attachments = false,
  className = "",
  ...props
}: PromptBarProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const prompt = value.trim();
    if (!prompt || disabled || sending) return;
    setSending(true);
    try {
      await onSend(prompt);
      setValue("");
    } finally {
      setSending(false);
    }
  };
  return (
    <form className={`rb-prompt-bar ${className}`} onSubmit={submit}>
      {attachments && (
        <button type="button" aria-label="Attachments unavailable" disabled>
          <Paperclip size={16} />
        </button>
      )}
      <textarea
        {...props}
        aria-label={props["aria-label"] ?? "Prompt"}
        disabled={disabled || sending}
        onChange={(event) => setValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder={placeholder}
        rows={1}
        value={value}
      />
      <button
        aria-label="Send prompt"
        disabled={disabled || sending || !value.trim()}
        type="submit"
      >
        <ArrowUp size={17} />
      </button>
    </form>
  );
}

export default PromptBar;
