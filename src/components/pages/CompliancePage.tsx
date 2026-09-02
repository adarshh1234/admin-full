import { useToast } from '../../hooks/useToast';

import { useCompliance } from '../../hooks/useCompliance';
import { ComplianceList } from '../compliance/ComplianceList';
import { Loader } from '../common/Loader';
import type { ComplianceItemData } from '../../types/compliance';

export function CompliancePage() {
  const { items, isLoading, toggleItem } = useCompliance();
  const { showToast } = useToast();

  function handleConfigure(item: ComplianceItemData) {
    showToast(`Opening configuration for ${item.label}…`);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          <i className="fas fa-shield-alt" style={{ color: '#2563eb', marginRight: 8 }} /> Compliance &amp; Privacy
        </h3>
        <span className="tag-blue">GDPR ready</span>
      </div>
      {isLoading ? (
        <Loader label="Loading compliance settings…" />
      ) : (
        <ComplianceList items={items} onToggle={toggleItem} onConfigure={handleConfigure} />
      )}
    </div>
  );
}
