import { useToast } from '../../hooks/useToast';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fieldForceService } from '../../services/fieldforce.service';
import { AgentList } from '../fieldforce/AgentList';
import { CheckInActivity } from '../fieldforce/CheckInActivity';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';

export function FieldForcePage() {
  const { data: agents, isLoading: agentsLoading } = useAsyncData(() => fieldForceService.getAgents(), []);
  const { data: events, isLoading: eventsLoading } = useAsyncData(
    () => fieldForceService.getCheckInEvents(),
    [],
  );
  const { showToast } = useToast();

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          <i className="fas fa-map-marked-alt" style={{ color: '#2563eb', marginRight: 8 }} /> Field Force Overview
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast('Optimizing agent routes…')}
        >
          <i className="fas fa-route" /> Optimize Route
        </Button>
      </div>

      <div
        style={{
          background: '#eef2ff',
          borderRadius: 10,
          padding: 20,
          textAlign: 'center',
          color: '#6b7a8f',
          marginBottom: 16,
        }}
      >
        <i className="fas fa-map" style={{ fontSize: 28, color: '#2563eb' }} />
        <br />
        Interactive map placeholder — GPS tracking &amp; geo-fencing
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {agentsLoading || !agents ? <Loader label="Loading agents…" /> : <AgentList agents={agents} />}
        {eventsLoading || !events ? (
          <Loader label="Loading check-ins…" />
        ) : (
          <CheckInActivity events={events} />
        )}
      </div>
    </div>
  );
}
