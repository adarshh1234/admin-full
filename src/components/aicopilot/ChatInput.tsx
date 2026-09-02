import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  return (
    <div className="ai-input">
      <Input
        type="text"
        id="aiInput"
        placeholder="Ask Copilot to draft, summarize, or suggest..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSend();
        }}
      />
      <Button id="aiSendBtn" onClick={onSend} disabled={disabled}>
        <i className={disabled ? 'fas fa-circle-notch fa-spin' : 'fas fa-paper-plane'} />
      </Button>
    </div>
  );
}

