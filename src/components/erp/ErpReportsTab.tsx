import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';

interface ErpReportsTabProps {
  onNavigateDashboard: () => void;
}

export function ErpReportsTab({ onNavigateDashboard }: ErpReportsTabProps) {
  const { showToast } = useToast();

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          <i className="fas fa-chart-pie" style={{ color: '#2563eb', marginRight: 10 }} /> Reports &amp; Analytics
        </h3>
        <span className="tag-blue">AD · Insights</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Revenue
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-arrow-up" style={{ color: '#16a34a', marginRight: 6 }} /> $2.4M · +18%
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Market
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-globe" style={{ color: '#2563eb', marginRight: 6 }} /> 12 regions
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Product
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-cube" style={{ color: '#2563eb', marginRight: 6 }} /> 46 modules
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>
            Customer
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-users" style={{ color: '#2563eb', marginRight: 6 }} /> 1,284 active
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => showToast('Exporting PDF report...', 'info')}
        >
          <i className="fas fa-file-pdf" /> Export PDF
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => showToast('Exporting Excel report...', 'info')}
        >
          <i className="fas fa-file-excel" /> Export Excel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onNavigateDashboard}
        >
          <i className="fas fa-chart-line" /> View Full Dashboard
        </Button>
      </div>
    </div>
  );
}

