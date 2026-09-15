import React, { useEffect, useState } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { LedgerEntry, Account, Party } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const GeneralLedger: React.FC = () => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [accountFilter, setAccountFilter] = useState('All');
  const [partyFilter, setPartyFilter] = useState('All');
  const [refTypeFilter, setRefTypeFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [includeReverted, setIncludeReverted] = useState(false);

  useEffect(() => {
    loadAccountsAndParties();
  }, []);

  useEffect(() => {
    loadLedger();
  }, [accountFilter, partyFilter, refTypeFilter, fromDate, toDate, includeReverted]);

  async function loadAccountsAndParties() {
    try {
      const [accRes, pRes] = await Promise.all([
        acmasoService.getAccounts(),
        acmasoService.getParties(),
      ]);
      setAccounts(accRes.filter((a) => !a.isGroup));
      setParties(pRes);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadLedger() {
    setLoading(true);
    try {
      const res = await acmasoService.getGeneralLedger({
        account: accountFilter,
        party: partyFilter,
        referenceType: refTypeFilter,
        fromDate,
        toDate,
        includeReverted,
      });
      setEntries(res.rows || []);
      setSummary(res.summary || {});
    } catch (err: any) {
      showToast('Failed to load General Ledger data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    if (entries.length === 0) return;
    const headers = ['#', 'Date', 'Account', 'Party', 'Voucher Type', 'Voucher #', 'Debit (INR)', 'Credit (INR)', 'Balance (INR)'];
    const rows = entries.map((e) => [
      e.index || 1,
      e.date,
      `"${e.account}"`,
      `"${e.party || ''}"`,
      e.referenceType,
      e.referenceName,
      e.debit,
      e.credit,
      e.balance || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `General_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('General Ledger exported as CSV.', 'success');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filters Toolbar */}
      <div className="panel" style={{ padding: '16px 20px', background: '#f8fafc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Filter Account</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              style={{ width: '100%', height: 36, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
            >
              <option value="All">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Filter Party</label>
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              style={{ width: '100%', height: 36, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
            >
              <option value="All">All Parties</option>
              {parties.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Voucher Type</label>
            <select
              value={refTypeFilter}
              onChange={(e) => setRefTypeFilter(e.target.value)}
              style={{ width: '100%', height: 36, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
            >
              <option value="All">All Vouchers</option>
              <option value="SalesInvoice">Sales Invoices</option>
              <option value="PurchaseInvoice">Purchase Invoices</option>
              <option value="Payment">Payments</option>
              <option value="JournalEntry">Journal Entries</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>From Date</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: '100%', height: 36, fontSize: 12 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>To Date</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: '100%', height: 36, fontSize: 12 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18 }}>
            <input
              type="checkbox"
              id="revertedToggle"
              checked={includeReverted}
              onChange={(e) => setIncludeReverted(e.target.checked)}
            />
            <label htmlFor="revertedToggle" style={{ fontSize: 12, color: '#64748b', cursor: 'pointer' }}>
              Include Reverted
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <Button variant="outline" size="sm" onClick={handleExportCsv} style={{ height: 36 }}>
              <i className="fas fa-download" style={{ marginRight: 4 }} /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAccountFilter('All');
                setPartyFilter('All');
                setRefTypeFilter('All');
                setFromDate('');
                setToDate('');
                setIncludeReverted(false);
              }}
              style={{ height: 36 }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <Loader label="Computing General Ledger transactions..." />
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#2563eb', color: '#ffffff' }}>
                  {['#', 'Date', 'Account', 'Party', 'Voucher Type', 'Reference #', 'Debit (₹)', 'Credit (₹)', 'Running Balance (₹)'].map((h) => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: h.includes('(₹)') ? 'right' : 'left', fontWeight: 600, fontSize: 12 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((row, idx) => (
                  <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: row.reverted ? '#fef2f2' : undefined }}>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{row.index || idx + 1}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>{row.date}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{row.account}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{row.party || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                        {row.referenceType}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>{row.referenceName}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: row.debit > 0 ? 700 : 400, color: row.debit > 0 ? '#0f172a' : '#94a3b8' }}>
                      {row.debit > 0 ? `₹${Number(row.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: row.credit > 0 ? 700 : 400, color: row.credit > 0 ? '#0f172a' : '#94a3b8' }}>
                      {row.credit > 0 ? `₹${Number(row.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: (row.balance || 0) >= 0 ? '#059669' : '#dc2626' }}>
                      ₹{Number(row.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                      No ledger postings match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
              {entries.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={6} style={{ padding: '12px 14px', fontSize: 13, color: '#0f172a' }}>Closing Ledger Summary</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>₹{Number(summary.totalDebit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>₹{Number(summary.totalCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#2563eb', fontSize: 13 }}>₹{Number(summary.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
