import { useToast } from '../../hooks/useToast';
import { useAsyncData } from '../../hooks/useAsyncData';
import { pipelineService } from '../../services/pipeline.service';
import { Loader } from '../common/Loader';
import { PipelineBoard } from '../pipeline/PipelineBoard';
import { Button } from '../common/Button';

export function PipelinePage() {
  const { data: pipeline, isLoading } = useAsyncData(() => pipelineService.getFullPipeline(), []);
  const { showToast } = useToast();

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          <i className="fas fa-chart-line" style={{ color: '#2563eb', marginRight: 8 }} /> Full Pipeline
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast('Add Deal form coming soon.')}
        >
          <i className="fas fa-plus" /> Add Deal
        </Button>
      </div>
      {isLoading || !pipeline ? <Loader label="Loading pipeline…" /> : <PipelineBoard columns={pipeline} />}
    </div>
  );
}

