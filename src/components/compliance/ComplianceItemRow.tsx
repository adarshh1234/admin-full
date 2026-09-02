import type { ComplianceItemData } from '../../types/compliance';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Button } from '../common/Button';

interface ComplianceItemRowProps {
  item: ComplianceItemData;
  onToggle: (id: string) => void;
  onConfigure: (item: ComplianceItemData) => void;
}

export function ComplianceItemRow({ item, onToggle, onConfigure }: ComplianceItemRowProps) {
  return (
    <div className="compliance-item">
      <span>
        <i className={item.icon} style={{ color: '#2563eb', width: 24 }} /> {item.label}
      </span>
      {item.control === 'select' && (
        <span>
          <select style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid #e9edf4' }}>
            {item.options?.map((option) => <option key={option}>{option}</option>)}
          </select>
        </span>
      )}
      {item.control === 'toggle' && (
        <ToggleSwitch active={Boolean(item.active)} onToggle={() => onToggle(item.id)} label={item.label} />
      )}
      {item.control === 'button' && (
        <span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(item)}
          >
            {item.buttonLabel}
          </Button>
        </span>
      )}
    </div>
  );
}

