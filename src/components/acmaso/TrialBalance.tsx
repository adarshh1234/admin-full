import React, { useEffect, useState } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const TrialBalance: React.FC = () => {
  const { showToast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ totalDebit: 0, totalCredit: 0, isBalanced: true });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadTrialBalance();
  }, [fromDate, toDate]);

  async function loadTrialBalance() {
    setLoading(true);
    try {
      const res = await acmasoService.getTrialBalance({ fromDate, toDate });
      setRows(res.rows || []);
      setTotals(res.totals || { totalDebit: 0, totalCredit: 0, isBalanced: true });
    } catch (err: any) {
      showToast('Failed to calculate Trial Balance.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    if (rows.length === 0) return;
    const headers = ['Account Name', 'Root Category', 'Debit Balance (INR)', 'Credit Balance (INR)'];
    const dataRows = rows.map((r) => [
      `"${r.account}"`,
      r.rootType,
      r.debit || 0,
      r.credit || 0,
    ]);
    dataRows.push(['TOTAL', '', totals.totalDebit, totals.totalCredit]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...dataRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Trial_Balance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Trial Balance exported as CSV.', 'success');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a2540' }}>Trial Balance</h3>
          <span style={{ fontSize: 12.5, color: '#64748b' }}>
            Verification of double-entry ledger equality across all active debit and credit balances.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ height: 36, fontSize: 12 }} />
          <span style={{ color: '#94a3b8' }}>to</span>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ height: 36, fontSize: 12 }} />
          <Button variant="outline" size="sm" onClick={handleExportCsv} style={{ height: 36 }}>
            <i className="fas fa-download" style={{ marginRight: 4 }} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Balance Indicator Banner */}
      <div
        style={{
          background: totals.isBalanced ? '#f0fdf4' : '#fef2f2',
          border: `1.5px solid ${totals.isBalanced ? '#86efac' : '#fca5a5'}`,
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
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: totals.isBalanced ? '#dcfce7' : '#fee2e2', color: totals.isBalanced ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            <i className={`fas ${totals.isBalanced ? 'fa-scale-balanced' : 'fa-triangle-exclamation'}`} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: totals.isBalanced ? '#166534' : '#991b1b' }}>
              {totals.isBalanced ? 'Trial Balance is Fully Balanced (Debit = Credit)' : 'Imbalance Detected in Ledger'}
            </div>
            <div style={{ fontSize: 12, color: totals.isBalanced ? '#15803d' : '#b91c1c' }}>
              {totals.isBalanced ? 'All underlying ledger debits match credits.' : `Debit and Credit difference: ₹${Math.abs(totals.totalDebit - totals.totalCredit).toFixed(2)}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
          <div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Debit</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>₹{Number(totals.totalDebit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Credit</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>₹{Number(totals.totalCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      {loading ? (
        <Loader label="Calculating Trial Balance..." />
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  {['Account Title', 'Category', 'Debit Balance (₹)', 'Credit Balance (₹)'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h.includes('(₹)') ? 'right' : 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{row.account}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          background: row.rootType === 'Asset' ? '#eff6ff' : row.rootType === 'Liability' ? '#fef3c7' : row.rootType === 'Income' ? '#ecfdf5' : '#fdf2f8',
                          color: row.rootType === 'Asset' ? '#2563eb' : row.rootType === 'Liability' ? '#b45309' : row.rootType === 'Income' ? '#059669' : '#be185d',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {row.rootType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: row.debit > 0 ? 700 : 400, color: row.debit > 0 ? '#0f172a' : '#94a3b8' }}>
                      {row.debit > 0 ? `₹${Number(row.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: row.credit > 0 ? 700 : 400, color: row.credit > 0 ? '#0f172a' : '#94a3b8' }}>
                      {row.credit > 0 ? `₹${Number(row.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan={2} style={{ padding: '14px 16px', fontSize: 14, color: '#0f172a' }}>Grand Total</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#059669', fontSize: 14 }}>
                    ₹{Number(totals.totalDebit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#059669', fontSize: 14 }}>
                    ₹{Number(totals.totalCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
