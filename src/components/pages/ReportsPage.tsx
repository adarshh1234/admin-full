import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';

interface ReportsPageProps {
  onNavigateDashboard?: () => void;
}

export function ReportsPage({ onNavigateDashboard }: ReportsPageProps) {
  const { showToast } = useToast();

  return (
    <div className="panel module-detail" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="header">
        <div className="icon-lg">
          <i className="fas fa-chart-pie" />
        </div>
        <h2>Reports &amp; Analytics</h2>
        <span className="tag-blue" style={{ marginLeft: 'auto', fontSize: 12 }}>
          AD · Insights
        </span>
      </div>

      <div className="fields">
        <div className="field-group half">
          <label>Revenue</label>
          <div className="form-control" style={{ background: '#f8faff' }}>
            <i className="fas fa-arrow-up" style={{ color: '#16a34a', marginRight: 6 }} /> $2.4M · +18%
          </div>
        </div>
        <div className="field-group half">
          <label>Market</label>
          <div className="form-control" style={{ background: '#f8faff' }}>
            <i className="fas fa-globe" style={{ color: '#2563eb', marginRight: 6 }} /> 12 regions
          </div>
        </div>
        <div className="field-group half">
          <label>Product</label>
          <div className="form-control" style={{ background: '#f8faff' }}>
            <i className="fas fa-cube" style={{ color: '#2563eb', marginRight: 6 }} /> 46 modules
          </div>
        </div>
        <div className="field-group half">
          <label>Customer</label>
          <div className="form-control" style={{ background: '#f8faff' }}>
            <i className="fas fa-users" style={{ color: '#2563eb', marginRight: 6 }} /> 1,284 active
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button
          variant="outline"
          onClick={() => showToast('Exporting PDF report…', 'info')}
        >
          <i className="fas fa-file-pdf" /> Export PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => showToast('Exporting Excel report…', 'info')}
        >
          <i className="fas fa-file-excel" /> Export Excel
        </Button>
        <Button variant="primary" onClick={onNavigateDashboard}>
          <i className="fas fa-chart-line" /> View Full Dashboard
        </Button>
      </div>
    </div>
  );
}

