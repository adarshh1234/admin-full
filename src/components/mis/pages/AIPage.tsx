import { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { generateAIAnalysis } from '../utils/aiAnalysis';

function statusTag(status: string): string {
  if (status.includes('Track') || status.includes('Healthy') || status.includes('Optimal') || status === '✅ OK') return 'mis-tag-green';
  return 'mis-tag-red';
}

export default function AIPage() {
  const { dailyRows, recurringExpenses, duesData, crmDeals, annualRows, staffData, marketingData } = useDashboard();

  const { suggestions, issues, summaryRows } = useMemo(
    () => generateAIAnalysis({ dailyRows, recurringExpenses, duesData, crmDeals, annualRows, staffData, marketingData }),
    [dailyRows, recurringExpenses, duesData, crmDeals, annualRows, staffData, marketingData]
  );

  return (
    <section id="tab-ai" className="mis-tab-panel">
      <div className="mis-section-title">AI Suggestions &amp; Key Issues</div>
      <div className="mis-section-desc">Automated insights generated from cross-departmental data. Updated dynamically based on current numbers.</div>
      <div className="mis-formula-note">Rules engine evaluates thresholds (e.g., CAC &gt; $80, Overdue &gt; $10k, Pipeline &lt; $500k). Suggestions are actionable recommendations.</div>
      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>🔍 Top 3 AI Suggestions</h3>
          <div>
            {suggestions.slice(0, 3).map((s) => (
              <div key={s.id} style={{ marginBottom: 8, padding: 8, background: '#E3F2FD', borderRadius: 4 }}>💡 {s.text}</div>
            ))}
          </div>
        </div>
        <div className="mis-internal-box">
          <h3>⚠️ Key Issues to Address</h3>
          <div>
            {issues.length ? (
              issues.map((it) => (
                <div key={it.id} style={{ marginBottom: 8, padding: 8, background: it.severity === 'high' ? '#FDECEA' : '#FFF8E1', borderRadius: 4 }}>⚠️ {it.text}</div>
              ))
            ) : (
              <p>No critical issues detected.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-aiSummaryTable">
          <thead><tr><th>Metric</th><th>Current Value</th><th>Threshold</th><th>Status</th></tr></thead>
          <tbody>
            {summaryRows.map((r) => (
              <tr key={r.metric}>
                <td>{r.metric}</td>
                <td>{r.value}</td>
                <td>{r.threshold}</td>
                <td><span className={`mis-tag ${statusTag(r.status)}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
