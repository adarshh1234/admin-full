import { useDashboard } from '../context/DashboardContext';
import { exportPDF, exportExcel } from '../utils/exportUtils';

export default function MISHeader() {
  const {
    dailyRows, weeklyRows, monthlyRows, annualRows, staffData, crmDeals,
    duesData, recurringExpenses, taxLegal, marketingData, socialMediaData, expansionData,
  } = useDashboard();

  const handleExportPDF = () => {
    void exportPDF('mis-dashboard-capture');
  };

  const handleExportExcel = () => {
    exportExcel({
      dailyRows, weeklyRows, monthlyRows, annualRows, staffData, crmDeals,
      duesData, recurringExpenses, taxLegal, marketingData, socialMediaData, expansionData,
    });
  };

  return (
    <div className="mis-page-header">
      <div className="mis-page-title">
        <h1>
          <i className="fas fa-chart-bar" /> MIS Dashboard
        </h1>
        <div className="mis-page-subtitle">
          Marketplace &amp; Internal Operations Intelligence • Real-time Data Analytics
        </div>
      </div>

      <div className="mis-action-group">
        <button type="button" className="mis-btn-action" onClick={handleExportPDF}>
          <i className="fas fa-file-pdf" style={{ color: '#ef4444' }} /> Export PDF
        </button>
        <button type="button" className="mis-btn-action" onClick={handleExportExcel}>
          <i className="fas fa-file-excel" style={{ color: '#10b981' }} /> Export Excel
        </button>
        <button type="button" className="mis-btn-action mis-btn-action-primary" onClick={() => window.print()}>
          <i className="fas fa-print" /> Print Report
        </button>
      </div>
    </div>
  );
}
