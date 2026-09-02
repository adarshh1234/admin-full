import type { Integration } from '../../types/integration';
import { Button } from '../common/Button';

export function IntegrationCard({
  integration,
  onAction,
}: {
  integration: Integration;
  onAction: (integration: Integration) => void;
}) {
  return (
    <div className="integration-card">
      <div className="icon">
        <i className={integration.icon} />
      </div>
      <div className="name">{integration.name}</div>
      <div className={`status ${integration.status}`}>
        <i className={integration.status === 'connected' ? 'fas fa-check-circle' : 'fas fa-times-circle'} />{' '}
        {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
      </div>
      <Button
        variant="outline"
        size="sm"
        style={{ marginTop: 6 }}
        onClick={() => onAction(integration)}
      >
        {integration.actionLabel}
      </Button>
    </div>
  );
}

