import React, { useEffect, useState } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { JournalEntry, Account, Party } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const JournalEntries: React.FC = () => {
  const { showToast } = useToast();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingJournal, setViewingJournal] = useState<JournalEntry | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryType, setEntryType] = useState('Journal Entry');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [userRemark, setUserRemark] = useState('');
  const [accountRows, setAccountRows] = useState([
    { account: '', debit: 0, credit: 0, party: '' },
    { account: '', debit: 0, credit: 0, party: '' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [jRes, accRes, pRes] = await Promise.all([
        acmasoService.getJournalEntries(),
        acmasoService.getAccounts(),
        acmasoService.getParties(),
      ]);
      setJournals(jRes);
      setAccounts(accRes.filter((a) => !a.isGroup));
      setParties(pRes);
    } catch (err: any) {
      showToast('Failed to load journal entries.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleAddRow() {
    setAccountRows([...accountRows, { account: '', debit: 0, credit: 0, party: '' }]);
  }

  function handleRowChange(index: number, field: string, value: any) {
    const updated = [...accountRows];
    updated[index] = { ...updated[index], [field]: value };
    // If setting debit, clear credit on that line, and vice versa
    if (field === 'debit' && Number(value) > 0) {
      updated[index].credit = 0;
    } else if (field === 'credit' && Number(value) > 0) {
      updated[index].debit = 0;
    }
    setAccountRows(updated);
  }

  const totalDebit = accountRows.reduce((sum, r) => sum + (Number(r.debit) || 0), 0);
  const totalCredit = accountRows.reduce((sum, r) => sum + (Number(r.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
  const imbalance = Math.abs(totalDebit - totalCredit);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) {
      showToast(`Cannot post unbalanced journal voucher! Debit (₹${totalDebit}) must equal Credit (₹${totalCredit}).`, 'error');
      return;
    }

    const unselected = accountRows.some((r) => !r.account);
    if (unselected) {
      showToast('Please select accounts for all journal rows.', 'error');
      return;
    }

    try {
      const payload = {
        date,
        entryType,
        referenceNumber,
        userRemark,
        accounts: accountRows.map((r) => ({
          account: r.account,
          debit: Number(r.debit) || 0,
          credit: Number(r.credit) || 0,
          party: r.party || '',
        })),
      };

      const res = await acmasoService.createJournalEntry(payload);
      showToast(`Journal voucher ${res.entryNumber} posted to General Ledger!`, 'success');
      setShowModal(false);
      // Reset form
      setAccountRows([
        { account: '', debit: 0, credit: 0, party: '' },
        { account: '', debit: 0, credit: 0, party: '' },
      ]);
      setUserRemark('');
      loadData();
    } catch (err: any) {
      showToast(`Posting failed: ${err.message}`, 'error');
    }
  }

  async function handleCancel(journal: JournalEntry) {
    if (!window.confirm(`Cancel journal voucher ${journal.entryNumber}? This will revert all associated ledger postings.`)) return;
    try {
      await acmasoService.cancelJournalEntry(journal.id);
      showToast(`Journal ${journal.entryNumber} cancelled and ledger reversed.`, 'info');
      loadData();
    } catch (err: any) {
      showToast(`Cancel failed: ${err.message}`, 'error');
    }
  }

  const filtered = journals.filter(
    (j) =>
      j.entryNumber.toLowerCase().includes(search.toLowerCase()) ||
      (j.userRemark || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.referenceNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', width: 280 }}>
          <Input
            type="text"
            placeholder="Search journal vouchers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13, height: 38, width: '100%' }}
          />
          <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }} />
        </div>

        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus" style={{ marginRight: 6 }} /> New Journal Entry Voucher
        </Button>
      </div>

      {/* Journal Table */}
      {loading ? (
        <Loader label="Loading journal vouchers..." />
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  {['Voucher #', 'Date', 'Type', 'Accounts Involved', 'Debit Total (₹)', 'Credit Total (₹)', 'Remark', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: h.includes('(₹)') ? 'right' : 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>{j.entryNumber}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{j.date}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>
                        {j.entryType || 'Journal Entry'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#1e293b' }}>
                      {(j.accounts || []).map((a) => a.account).join(' ↔ ')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      ₹{Number(j.totalDebit).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      ₹{Number(j.totalCredit).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {j.userRemark || '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: j.status === 'Submitted' ? '#dcfce7' : '#f1f5f9',
                          color: j.status === 'Submitted' ? '#16a34a' : '#64748b',
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        {j.status || 'Submitted'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ fontSize: 11.5, padding: '4px 8px', marginRight: 6 }}
                        onClick={() => setViewingJournal(j)}
                      >
                        <i className="fas fa-eye" /> View
                      </Button>
                      {j.status === 'Submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ fontSize: 11.5, padding: '4px 8px', color: '#ef4444', borderColor: '#ef4444' }}
                          onClick={() => handleCancel(j)}
                        >
                          <i className="fas fa-ban" /> Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                      No journal vouchers recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Double-Entry Voucher Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 780, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Double-Entry Journal Voucher</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Debit Total MUST equal Credit Total before voucher can be posted.</span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Posting Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Entry Type</label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value)}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                  >
                    {['Journal Entry', 'Inter Bank Transfer', 'Cash Entry', 'Credit Note', 'Debit Note', 'Depreciation Entry'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Reference #</label>
                  <Input
                    type="text"
                    placeholder="e.g. REF-2026-09"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={{ width: '100%', height: 38 }}
                  />
                </div>
              </div>

              {/* Multi-Account Ledger Table */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Accounts, Debits &amp; Credits</label>
                {accountRows.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <select
                      value={row.account}
                      onChange={(e) => handleRowChange(idx, 'account', e.target.value)}
                      style={{ height: 36, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.name}>{a.name} ({a.rootType})</option>
                      ))}
                    </select>

                    <select
                      value={row.party}
                      onChange={(e) => handleRowChange(idx, 'party', e.target.value)}
                      style={{ height: 36, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
                    >
                      <option value="">-- Party (Optional) --</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>

                    <Input
                      type="number"
                      placeholder="Debit (₹)"
                      value={row.debit || ''}
                      onChange={(e) => handleRowChange(idx, 'debit', Number(e.target.value))}
                      style={{ height: 36, fontSize: 12.5, fontWeight: row.debit ? 700 : 400 }}
                    />

                    <Input
                      type="number"
                      placeholder="Credit (₹)"
                      value={row.credit || ''}
                      onChange={(e) => handleRowChange(idx, 'credit', Number(e.target.value))}
                      style={{ height: 36, fontSize: 12.5, fontWeight: row.credit ? 700 : 400 }}
                    />

                    {accountRows.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setAccountRows(accountRows.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    )}
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={handleAddRow} style={{ marginTop: 6, fontSize: 12 }}>
                  <i className="fas fa-plus" style={{ marginRight: 4 }} /> Add Account Line
                </Button>
              </div>

              {/* Balance Verification Strip */}
              <div
                style={{
                  background: isBalanced ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${isBalanced ? '#86efac' : '#fca5a5'}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: isBalanced ? '#166534' : '#991b1b' }}>
                    {isBalanced ? (
                      <span><i className="fas fa-check-circle" /> Balanced Voucher</span>
                    ) : (
                      <span><i className="fas fa-triangle-exclamation" /> Unbalanced Voucher (Difference: ₹{imbalance.toFixed(2)})</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, fontWeight: 700 }}>
                  <span style={{ color: '#1e293b' }}>Total Debit: <strong>₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                  <span style={{ color: '#1e293b' }}>Total Credit: <strong>₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>User Remark / Narration</label>
                <textarea
                  value={userRemark}
                  onChange={(e) => setUserRemark(e.target.value)}
                  placeholder="Being amount adjusted for..."
                  rows={2}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={!isBalanced}>
                  Post Journal Voucher
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Voucher Drawer */}
      {viewingJournal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '85vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{viewingJournal.entryNumber}</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Date: {viewingJournal.date} | Type: {viewingJournal.entryType || 'Journal Entry'}</span>
              </div>
              <button onClick={() => setViewingJournal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Account</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Party</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingJournal.accounts.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{row.account}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.party || '—'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: row.debit > 0 ? 700 : 400 }}>
                        {row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: row.credit > 0 ? 700 : 400 }}>
                        {row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                    <td colSpan={2} style={{ padding: '8px 12px' }}>Total</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#059669' }}>₹{viewingJournal.totalDebit.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#059669' }}>₹{viewingJournal.totalCredit.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {viewingJournal.userRemark && (
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12.5, color: '#475569', marginBottom: 18 }}>
                <strong>Narration:</strong> {viewingJournal.userRemark}
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <Button variant="outline" onClick={() => setViewingJournal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
