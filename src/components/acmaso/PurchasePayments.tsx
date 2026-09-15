import React, { useEffect, useState, useMemo } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { PurchasePayment, PurchaseInvoice, Party, PaymentMethod } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

interface PurchasePaymentsProps {
  initialSelectedInvoice?: PurchaseInvoice | null;
}

export const PurchasePayments: React.FC<PurchasePaymentsProps> = ({ initialSelectedInvoice }) => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<PurchasePayment[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'All'>(50);
  const [showCreateModal, setShowCreateModal] = useState(!!initialSelectedInvoice);

  // Form State
  const [party, setParty] = useState(initialSelectedInvoice?.party || '');
  const [forInvoice, setForInvoice] = useState(initialSelectedInvoice?.invoiceNumber || '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState<number>(initialSelectedInvoice?.outstandingAmount || 0);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialSelectedInvoice) {
      setParty(initialSelectedInvoice.party);
      setForInvoice(initialSelectedInvoice.invoiceNumber);
      setAmount(initialSelectedInvoice.outstandingAmount || initialSelectedInvoice.grandTotal);
      setShowCreateModal(true);
    }
  }, [initialSelectedInvoice]);

  async function loadData() {
    setLoading(true);
    try {
      const [payRes, partiesRes, invRes, pmRes] = await Promise.all([
        acmasoService.getPurchasePayments(),
        acmasoService.getParties('Supplier'),
        acmasoService.getPurchaseInvoices(),
        acmasoService.getPaymentMethods(),
      ]);
      setPayments(payRes);
      setParties(partiesRes);
      setInvoices(invRes);
      setPaymentMethods(pmRes);
      if (pmRes.length > 0 && !paymentMethod) setPaymentMethod(pmRes[0].name);
      if (partiesRes.length > 0 && !party) setParty(partiesRes[0].name);
    } catch (err: any) {
      showToast('Failed to load purchase payments.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!party) {
      showToast('Please select a supplier.', 'error');
      return;
    }
    if (amount <= 0) {
      showToast('Payment amount must be greater than zero.', 'error');
      return;
    }

    try {
      const selectedPm = paymentMethods.find((p) => p.name === paymentMethod);
      const payload = {
        party,
        paymentMethod: paymentMethod || 'Bank Transfer (NEFT/RTGS/IMPS)',
        paymentAccount: selectedPm?.account || 'HDFC Bank Operating A/c',
        account: 'Creditors',
        date,
        amount: Number(amount),
        referenceNumber,
        forInvoice: forInvoice || undefined,
        notes,
      };

      const res = await acmasoService.createPurchasePayment(payload);
      showToast(`Supplier payout ${res.paymentNumber} posted to General Ledger!`, 'success');
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Payment recording failed: ${err.message}`, 'error');
    }
  }

  function handleExportCsv() {
    if (payments.length === 0) {
      showToast('No payments to export.', 'info');
      return;
    }
    const headers = ['#', 'Payment No', 'Status', 'Party', 'Posting Date', 'Amount'];
    const rows = filtered.map((p, idx) => [
      idx + 1,
      p.paymentNumber || p.id,
      p.status || 'Submitted',
      p.party,
      p.date,
      p.amount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.party.toLowerCase().includes(search.toLowerCase()) ||
        (p.referenceNumber || '').toLowerCase().includes(search.toLowerCase());

      const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [payments, search, methodFilter]);

  const supplierUnpaidInvoices = invoices.filter((i) => i.party === party && i.status !== 'Cancelled' && i.outstandingAmount > 0);

  const effectivePageSize = pageSize === 'All' ? filtered.length || 1 : pageSize;
  const totalPages = Math.ceil(filtered.length / effectivePageSize) || 1;
  const paginatedPayments = useMemo(() => {
    if (pageSize === 'All') return filtered;
    const start = (currentPage - 1) * effectivePageSize;
    return filtered.slice(start, start + effectivePageSize);
  }, [filtered, currentPage, effectivePageSize, pageSize]);

  return (
    <div style={{ background: '#ffffff', minHeight: '100%', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
      {/* Frappe Books Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Search toggle & Nav buttons */}
          <div style={{ display: 'inline-flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              style={{
                background: showSearchInput ? '#f1f5f9' : '#ffffff',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                color: '#64748b',
                borderRight: '1px solid #e2e8f0',
              }}
              title="Search"
            >
              <i className="fas fa-search" style={{ fontSize: 13 }} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{
                background: '#ffffff',
                border: 'none',
                padding: '8px 10px',
                cursor: currentPage > 1 ? 'pointer' : 'default',
                color: currentPage > 1 ? '#64748b' : '#cbd5e1',
                borderRight: '1px solid #e2e8f0',
              }}
              title="Previous"
            >
              <i className="fas fa-chevron-left" style={{ fontSize: 11 }} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{
                background: '#ffffff',
                border: 'none',
                padding: '8px 10px',
                cursor: currentPage < totalPages ? 'pointer' : 'default',
                color: currentPage < totalPages ? '#64748b' : '#cbd5e1',
              }}
              title="Next"
            >
              <i className="fas fa-chevron-right" style={{ fontSize: 11 }} />
            </button>
          </div>

          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Purchase Payments</h1>

          {showSearchInput && (
            <div style={{ position: 'relative', width: 220, marginLeft: 8 }}>
              <Input
                type="text"
                placeholder="Type to filter..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                autoFocus
                style={{ height: 34, fontSize: 12.5, width: '100%', paddingLeft: 10 }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleExportCsv}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Export
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                background: methodFilter !== 'All' ? '#e2e8f0' : '#f1f5f9',
                border: 'none',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <i className="fas fa-filter" style={{ fontSize: 11 }} /> Filter
            </button>

            {showFilterDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  width: 220,
                  padding: 8,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 8px' }}>PAYMENT METHOD</div>
                {['All', 'Bank Transfer (NEFT/RTGS/IMPS)', 'UPI / Online QR', 'Cash', 'Cheque / Draft', 'Credit / Debit Card'].map((pm) => (
                  <div
                    key={pm}
                    onClick={() => {
                      setMethodFilter(pm);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '6px 8px',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      borderRadius: 4,
                      background: methodFilter === pm ? '#f1f5f9' : 'transparent',
                      fontWeight: methodFilter === pm ? 600 : 400,
                      color: '#1e293b',
                    }}
                  >
                    {pm}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#1e293b',
              border: 'none',
              borderRadius: 6,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            title="Make Entry (New Purchase Payment)"
          >
            <i className="fas fa-plus" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader label="Loading purchase payments..." />
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            color: '#64748b',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              border: '2px solid #cbd5e1',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <i className="far fa-file-lines" style={{ fontSize: 32, color: '#94a3b8' }} />
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16, fontWeight: 500 }}>No entries found</div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Make Entry
          </button>
        </div>
      ) : (
        /* Table */
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ width: 40, padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Payment No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Party</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Posting Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map((pay, idx) => {
                const globalIndex = pageSize === 'All' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={pay.id}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{globalIndex}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{pay.paymentNumber}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          background: '#dcfce7',
                          color: '#16a34a',
                          padding: '3px 10px',
                          borderRadius: 14,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {pay.status || 'Submitted'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{pay.party}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{pay.date}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                      ₹ {Number(pay.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Frappe Books Bottom Pagination Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          borderTop: '1px solid #f1f5f9',
          fontSize: 13,
          color: '#64748b',
        }}
      >
        <div>
          {filtered.length === 0
            ? '0'
            : pageSize === 'All'
            ? `1 - ${filtered.length}`
            : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filtered.length)}`}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{
              background: 'none',
              border: 'none',
              cursor: currentPage > 1 ? 'pointer' : 'default',
              color: currentPage > 1 ? '#64748b' : '#cbd5e1',
            }}
          >
            <i className="fas fa-chevron-left" style={{ fontSize: 11 }} />
          </button>
          <span style={{ fontSize: 12.5, color: '#475569' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            style={{
              background: 'none',
              border: 'none',
              cursor: currentPage < totalPages ? 'pointer' : 'default',
              color: currentPage < totalPages ? '#64748b' : '#cbd5e1',
            }}
          >
            <i className="fas fa-chevron-right" style={{ fontSize: 11 }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[50, 100, 'All'].map((sz) => (
            <button
              key={sz}
              onClick={() => {
                setPageSize(sz as any);
                setCurrentPage(1);
              }}
              style={{
                background: pageSize === sz ? '#f1f5f9' : 'transparent',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 12.5,
                fontWeight: pageSize === sz ? 600 : 400,
                color: pageSize === sz ? '#1e293b' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Record Payout Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Record Supplier Payout</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Debits Creditor Payable and Credits Bank/Cash Account.</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleCreatePayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Supplier *</label>
                <select
                  value={party}
                  onChange={(e) => {
                    setParty(e.target.value);
                    setForInvoice('');
                  }}
                  style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                >
                  {parties.map((p) => (
                    <option key={p.id} value={p.name}>{p.name} (Outstanding: ₹{Number(p.outstandingAmount || 0).toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              {supplierUnpaidInvoices.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Allocate Against Purchase Bill</label>
                  <select
                    value={forInvoice}
                    onChange={(e) => {
                      setForInvoice(e.target.value);
                      const inv = invoices.find((i) => i.invoiceNumber === e.target.value);
                      if (inv) setAmount(inv.outstandingAmount);
                    }}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                  >
                    <option value="">-- Direct Payment without specific bill --</option>
                    {supplierUnpaidInvoices.map((inv) => (
                      <option key={inv.id} value={inv.invoiceNumber}>
                        {inv.invoiceNumber} — Outstanding: ₹{Number(inv.outstandingAmount).toLocaleString('en-IN')} (Total: ₹{Number(inv.grandTotal).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                  >
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.name}>{pm.name} ({pm.account})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Amount Paid (₹) *</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ width: '100%', height: 38, fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Payout Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Bank Ref / UTR #</label>
                  <Input
                    type="text"
                    placeholder="e.g. HDFC-RTGS-981023"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={{ width: '100%', height: 38 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Remarks</label>
                <Input
                  type="text"
                  placeholder="Payment notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', height: 38 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Record Payout</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
