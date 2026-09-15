import React, { useEffect, useState } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const BalanceSheet: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState('');

  useEffect(() => {
    loadBalanceSheet();
  }, [asOfDate]);

  async function loadBalanceSheet() {
    setLoading(true);
    try {
      const res = await acmasoService.getBalanceSheet({ asOfDate });
      setData(res);
    } catch (err: any) {
      showToast('Failed to calculate Balance Sheet report.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    if (!data) return;
    const lines = [
      ['BALANCE SHEET STATEMENT'],
      ['As of Date:', asOfDate || 'Current'],
      [''],
      ['CATEGORY / ACCOUNT', 'AMOUNT (INR)'],
      ['APPLICATION OF FUNDS (ASSETS)', ''],
      ...(data.assets.rows || []).map((r: any) => [`  ${r.account}`, r.amount]),
      ['TOTAL ASSETS', data.assets.total],
      [''],
      ['SOURCE OF FUNDS (LIABILITIES & EQUITY)', ''],
      ['CURRENT LIABILITIES', ''],
      ...(data.liabilities.rows || []).map((r: any) => [`  ${r.account}`, r.amount]),
      ['TOTAL LIABILITIES', data.liabilities.total],
      [''],
      ['EQUITY & CAPITAL', ''],
      ...(data.equity.rows || []).map((r: any) => [`  ${r.account}`, r.amount]),
      ['  Current Period Earnings (P&L Net Profit)', data.equity.currentPeriodEarnings],
      ['TOTAL EQUITY', data.equity.total],
      [''],
      ['TOTAL LIABILITIES AND EQUITY', data.summary.totalLiabilitiesAndEquity],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map((l) => l.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Balance_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Balance Sheet exported as CSV.', 'success');
  }

  if (loading && !data) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Loader label="Compiling Balance Sheet from ledger..." />
      </div>
    );
  }

  const { assets, liabilities, equity, summary } = data || {
    assets: { rows: [], total: 0 },
    liabilities: { rows: [], total: 0 },
    equity: { rows: [], currentPeriodEarnings: 0, total: 0 },
    summary: { totalAssets: 0, totalLiabilitiesAndEquity: 0, isBalanced: true },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a2540' }}>Balance Sheet</h3>
          <span style={{ fontSize: 12.5, color: '#64748b' }}>
            Statement of Financial Position: Assets = Liabilities + Capital / Equity.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>As of Date:</label>
          <Input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} style={{ height: 36, fontSize: 12 }} />
          <Button variant="outline" size="sm" onClick={handleExportCsv} style={{ height: 36 }}>
            <i className="fas fa-download" style={{ marginRight: 4 }} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Equation Balance Verification Banner */}
      <div
        style={{
          background: summary.isBalanced ? '#f0fdf4' : '#fef2f2',
          border: `1.5px solid ${summary.isBalanced ? '#86efac' : '#fca5a5'}`,
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: summary.isBalanced ? '#dcfce7' : '#fee2e2', color: summary.isBalanced ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            <i className="fas fa-scale-balanced" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: summary.isBalanced ? '#166534' : '#991b1b' }}>
              {summary.isBalanced ? 'Accounting Equation Verified: Assets = Liabilities + Equity' : 'Balance Sheet Discrepancy'}
            </div>
            <div style={{ fontSize: 12, color: summary.isBalanced ? '#15803d' : '#b91c1c' }}>
              Financial statements reconcile across all asset and liability categories.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
          <div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Assets</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>₹{Number(summary.totalAssets || 0).toLocaleString('en-IN')}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Liab. &amp; Equity</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>₹{Number(summary.totalLiabilitiesAndEquity || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Two Column Table Grid: Assets vs Liabilities & Equity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        {/* Left: Assets */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: 14 }}>
            <i className="fas fa-wallet" style={{ marginRight: 8 }} /> Assets (Application of Funds)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {(assets.rows || []).map((row: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '11px 18px', color: '#1e293b' }}>{row.account}</td>
                  <td style={{ padding: '11px 18px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                <td style={{ padding: '14px 18px', fontSize: 14, color: '#2563eb' }}>TOTAL ASSETS</td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: 15, color: '#2563eb' }}>
                  ₹{Number(assets.total || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Right: Liabilities & Equity */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', background: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: 14 }}>
            <i className="fas fa-building-columns" style={{ marginRight: 8 }} /> Liabilities &amp; Equity (Source of Funds)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {/* Liabilities */}
              <tr style={{ background: '#f8fafc', fontWeight: 700, color: '#64748b' }}>
                <td colSpan={2} style={{ padding: '8px 18px', fontSize: 11.5 }}>CURRENT LIABILITIES</td>
              </tr>
              {(liabilities.rows || []).map((row: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 18px', color: '#1e293b' }}>{row.account}</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                    ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {/* Equity */}
              <tr style={{ background: '#f8fafc', fontWeight: 700, color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
                <td colSpan={2} style={{ padding: '8px 18px', fontSize: 11.5 }}>EQUITY &amp; ACCUMULATED EARNINGS</td>
              </tr>
              {(equity.rows || []).map((row: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 18px', color: '#1e293b' }}>{row.account}</td>
                  <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                    ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 18px', color: '#059669', fontWeight: 600 }}>Current Period Net Income (P&amp;L)</td>
                <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                  ₹{Number(equity.currentPeriodEarnings || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                <td style={{ padding: '14px 18px', fontSize: 14, color: '#0f172a' }}>TOTAL LIABILITIES &amp; EQUITY</td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: 15, color: '#0f172a' }}>
                  ₹{Number(summary.totalLiabilitiesAndEquity || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
