import React, { useEffect, useState } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const ProfitAndLoss: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadPnl();
  }, [fromDate, toDate]);

  async function loadPnl() {
    setLoading(true);
    try {
      const res = await acmasoService.getProfitAndLoss({ fromDate, toDate });
      setData(res);
    } catch (err: any) {
      showToast('Failed to calculate Profit & Loss report.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    if (!data) return;
    const lines = [
      ['PROFIT & LOSS STATEMENT'],
      ['Period:', `${fromDate || 'Start'} to ${toDate || 'Present'}`],
      [''],
      ['CATEGORY / ACCOUNT', 'AMOUNT (INR)'],
      ['INCOME', ''],
      ...(data.income.rows || []).map((r: any) => [`  ${r.account}`, r.amount]),
      ['TOTAL OPERATING INCOME', data.income.total],
      [''],
      ['DIRECT EXPENSES', ''],
      ...(data.directExpenses.rows || []).map((r: any) => [`  ${r.account}`, r.amount]),
      ['TOTAL DIRECT EXPENSES', data.directExpenses.total],
      ['GROSS PROFIT', data.summary.grossProfit],
      [''],
      ['INDIRECT OPERATING EXPENSES', ''],
      ...(data.indirectExpenses.rows || []).map((r: any) => [`  ${r.account}`, r.amount]),
      ['TOTAL INDIRECT EXPENSES', data.indirectExpenses.total],
      [''],
      ['NET PROFIT / (LOSS)', data.summary.netProfit],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map((l) => l.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Profit_and_Loss_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Profit & Loss exported as CSV.', 'success');
  }

  if (loading && !data) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Loader label="Compiling Profit and Loss statement from ledger entries..." />
      </div>
    );
  }

  const { income, directExpenses, indirectExpenses, summary } = data || {
    income: { rows: [], total: 0 },
    directExpenses: { rows: [], total: 0 },
    indirectExpenses: { rows: [], total: 0 },
    summary: { totalIncome: 0, totalExpense: 0, grossProfit: 0, netProfit: 0, isProfitable: true },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a2540' }}>Profit &amp; Loss Statement</h3>
          <span style={{ fontSize: 12.5, color: '#64748b' }}>
            Periodic operating revenue, direct costs, operating overheads and net income.
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

      {/* Summary KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Total Revenue</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 4 }}>
            ₹{Number(summary.totalIncome || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Gross Profit</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
            ₹{Number(summary.grossProfit || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Operating Expenses</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
            ₹{Number(summary.totalExpense || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px 20px', borderLeft: `4px solid ${summary.isProfitable ? '#059669' : '#dc2626'}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Net Operating Result</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: summary.isProfitable ? '#059669' : '#dc2626', marginTop: 4 }}>
            ₹{Number(summary.netProfit || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Statement Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
              <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>Account Category</th>
              <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Income Section */}
            <tr style={{ background: '#f1f5f9', fontWeight: 800, color: '#059669' }}>
              <td style={{ padding: '10px 18px' }}><i className="fas fa-arrow-trend-up" style={{ marginRight: 8 }} /> Operating Income</td>
              <td style={{ padding: '10px 18px', textAlign: 'right' }}>₹{Number(income.total || 0).toLocaleString('en-IN')}</td>
            </tr>
            {(income.rows || []).map((row: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 18px 10px 36px', color: '#1e293b' }}>{row.account}</td>
                <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                  ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}

            {/* 2. Direct Expenses & Gross Profit */}
            <tr style={{ background: '#f1f5f9', fontWeight: 800, color: '#d97706' }}>
              <td style={{ padding: '10px 18px' }}><i className="fas fa-box" style={{ marginRight: 8 }} /> Cost of Goods &amp; Direct Expenses</td>
              <td style={{ padding: '10px 18px', textAlign: 'right' }}>₹{Number(directExpenses.total || 0).toLocaleString('en-IN')}</td>
            </tr>
            {(directExpenses.rows || []).map((row: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 18px 10px 36px', color: '#1e293b' }}>{row.account}</td>
                <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                  ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}

            {/* Gross Profit Strip */}
            <tr style={{ background: '#eff6ff', fontWeight: 800, borderTop: '1.5px solid #bfdbfe', borderBottom: '1.5px solid #bfdbfe' }}>
              <td style={{ padding: '12px 18px', color: '#1d4ed8' }}>GROSS PROFIT (Income - Direct Expenses)</td>
              <td style={{ padding: '12px 18px', textAlign: 'right', color: '#1d4ed8', fontSize: 14 }}>
                ₹{Number(summary.grossProfit || 0).toLocaleString('en-IN')}
              </td>
            </tr>

            {/* 3. Indirect Expenses */}
            <tr style={{ background: '#f1f5f9', fontWeight: 800, color: '#64748b' }}>
              <td style={{ padding: '10px 18px' }}><i className="fas fa-building" style={{ marginRight: 8 }} /> Indirect Operating Expenses</td>
              <td style={{ padding: '10px 18px', textAlign: 'right' }}>₹{Number(indirectExpenses.total || 0).toLocaleString('en-IN')}</td>
            </tr>
            {(indirectExpenses.rows || []).map((row: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 18px 10px 36px', color: '#1e293b' }}>{row.account}</td>
                <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                  ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: summary.isProfitable ? '#ecfdf5' : '#fef2f2', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
              <td style={{ padding: '16px 18px', fontSize: 15, color: summary.isProfitable ? '#059669' : '#dc2626' }}>
                NET PROFIT / (LOSS) FOR PERIOD
              </td>
              <td style={{ padding: '16px 18px', textAlign: 'right', fontSize: 16, color: summary.isProfitable ? '#059669' : '#dc2626' }}>
                ₹{Number(summary.netProfit || 0).toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
