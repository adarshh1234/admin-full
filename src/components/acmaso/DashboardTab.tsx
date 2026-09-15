import React, { useEffect, useState } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { DashboardSummary } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

interface DashboardTabProps {
  onNavigateTab?: (tab: string, subTab?: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigateTab }) => {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await acmasoService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error(err);
      showToast('Could not load accounting dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Loader label="Loading Acmaso Accounting Dashboard..." />
      </div>
    );
  }

  const { kpis, pnlSummary, recentTransactions, topExpenses } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2540', margin: 0, letterSpacing: -0.3 }}>
            Acmaso Accounting Overview
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
            Real-time double-entry ledger summaries, cashflow liquidity, sales and tax metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => onNavigateTab?.('sales', 'invoices')}>
            <i className="fas fa-file-invoice" style={{ marginRight: 6 }} /> New Sales Invoice
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab?.('common', 'journal')}>
            <i className="fas fa-book" style={{ marginRight: 6 }} /> Journal Entry
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab?.('reports', 'trial-balance')}>
            <i className="fas fa-balance-scale" style={{ marginRight: 6 }} /> Trial Balance
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {/* Bank & Cash Liquidity */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Total Liquidity
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-university" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1a2540' }}>
            ₹{(kpis.bankBalance + kpis.cashBalance).toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span>Bank: <strong>₹{kpis.bankBalance.toLocaleString('en-IN')}</strong></span>
            <span>Cash: <strong>₹{kpis.cashBalance.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Sales Invoices */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Total Invoiced Sales
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-arrow-trend-up" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1a2540' }}>
            ₹{kpis.totalSales.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span style={{ color: '#059669' }}>Collected: <strong>₹{kpis.paidSales.toLocaleString('en-IN')}</strong></span>
            <span style={{ color: '#dc2626' }}>Unpaid: <strong>₹{kpis.unpaidSales.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Purchases & Payables */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Total Purchases
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-shopping-cart" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1a2540' }}>
            ₹{kpis.totalPurchases.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span>Unpaid Bills: <strong style={{ color: '#d97706' }}>₹{kpis.unpaidPurchases.toLocaleString('en-IN')}</strong></span>
            <span>Suppliers: <strong>{kpis.activeSuppliersCount}</strong></span>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: `4px solid ${pnlSummary.isProfitable ? '#059669' : '#dc2626'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Net Period Result
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: pnlSummary.isProfitable ? '#ecfdf5' : '#fef2f2', color: pnlSummary.isProfitable ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`fas ${pnlSummary.isProfitable ? 'fa-chart-pie' : 'fa-triangle-exclamation'}`} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: pnlSummary.isProfitable ? '#059669' : '#dc2626' }}>
            ₹{pnlSummary.netProfit.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span>Gross: <strong>₹{pnlSummary.grossProfit.toLocaleString('en-IN')}</strong></span>
            <span>Margin: <strong>{kpis.profitMargin}%</strong></span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Ledger Stream & Top Expense Accounts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        {/* Recent Ledger Entries */}
        <div className="panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a2540' }}>
                <i className="fas fa-list-check" style={{ color: '#2563eb', marginRight: 8 }} />
                Recent Ledger Postings
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: 12, color: '#64748b' }}>
                Audit trail of double-entry voucher updates.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab?.('reports', 'general-ledger')}
              style={{ fontSize: 11.5 }}
            >
              View Full Ledger →
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  {['Date', 'Account', 'Voucher', 'Debit (₹)', 'Credit (₹)'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h.includes('(₹)') ? 'right' : 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{tx.date}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a2540' }}>{tx.account}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#2563eb' }}>{tx.referenceName}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: tx.debit > 0 ? '#1a2540' : '#94a3b8' }}>
                      {tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: tx.credit > 0 ? '#1a2540' : '#94a3b8' }}>
                      {tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Expenses & Financial Breakdown */}
        <div className="panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a2540' }}>
                <i className="fas fa-wallet" style={{ color: '#d97706', marginRight: 8 }} />
                Expense &amp; Cost Centers
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: 12, color: '#64748b' }}>
                Highest expenditure categories for the current period.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab?.('reports', 'pnl')}
              style={{ fontSize: 11.5 }}
            >
              Profit &amp; Loss →
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topExpenses.map((exp, idx) => {
              const totalExp = pnlSummary.totalExpense || 1;
              const percent = Math.min(100, Math.round((exp.amount / totalExp) * 100));
              return (
                <div key={idx} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: '#1a2540' }}>{exp.account}</span>
                    <span style={{ fontWeight: 700, color: '#dc2626' }}>₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ height: 6, width: '100%', background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'right' }}>
                    {percent}% of total operating expenses
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
