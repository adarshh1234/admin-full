import { useToast } from '../../hooks/useToast';
import { useAsyncData } from '../../hooks/useAsyncData';
import { workflowsService } from '../../services/workflows.service';
import { Loader } from '../common/Loader';
import { WorkflowList } from '../workflows/WorkflowList';
import { Button } from '../common/Button';

export function WorkflowsPage() {
  const { data: workflows, isLoading } = useAsyncData(() => workflowsService.getWorkflows(), []);
  const { showToast } = useToast();

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          <i className="fas fa-bolt" style={{ color: '#2563eb', marginRight: 8 }} /> Automation Workflows
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast('New Workflow form coming soon.')}
        >
          <i className="fas fa-plus" /> New Workflow
        </Button>
      </div>
      {isLoading || !workflows ? <Loader label="Loading workflows…" /> : <WorkflowList workflows={workflows} />}
    </div>
  );
}

