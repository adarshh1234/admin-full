import React, { useEffect, useState, useMemo } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { SalesPayment, Party, SalesInvoice, Account, PaymentMethod } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const SalesPayments: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<SalesPayment[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [_accounts, setAccounts] = useState<Account[]>([]);
  const [_paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'All'>(50);

  // Modals & Details
  const [showModal, setShowModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<SalesPayment | null>(null);

  // Form State
  const [party, setParty] = useState('');
  const [numberSeries, setNumberSeries] = useState('PAY-');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateStr, setDateStr] = useState('');
  const [paymentType, setPaymentType] = useState<'Receive' | 'Pay'>('Receive');
  const [fromAccount, setFromAccount] = useState('Debtors');
  const [toAccount, setToAccount] = useState('Cash In Hand');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [clearanceDate, setClearanceDate] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [refDate, setRefDate] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [writeOff, setWriteOff] = useState<number>(0);
  const [attachmentName, setAttachmentName] = useState('');
  const [allocations, setAllocations] = useState<{ type: string; name: string; amount: number }[]>([
    { type: 'SalesInvoice', name: '', amount: 0 },
  ]);
  const [status, setStatus] = useState<'Draft' | 'Submitted'>('Submitted');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [forInvoice, setForInvoice] = useState('');
  const [notes, setNotes] = useState('');

  // Collapsible Sections
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [amountsOpen, setAmountsOpen] = useState(true);
  const [referencesOpen, setReferencesOpen] = useState(true);

  function getFormattedTimestamp() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const time = now.toTimeString().split(' ')[0];
    return `${month} ${day}, ${year} ${time}`;
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [payRes, partyRes, invRes, accRes, methodRes] = await Promise.all([
        acmasoService.getSalesPayments(),
        acmasoService.getParties('Customer'),
        acmasoService.getSalesInvoices(),
        acmasoService.getAccounts(),
        acmasoService.getPaymentMethods(),
      ]);
      setPayments(payRes || []);
      setParties(partyRes || []);
      setInvoices(invRes || []);
      setAccounts(accRes || []);
      setPaymentMethods(methodRes || []);
      if (partyRes.length > 0 && !party) setParty(partyRes[0].name);
    } catch {
      showToast('Failed to load received payments.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setNumberSeries('PAY-');
    setDate(new Date().toISOString().split('T')[0]);
    setDateStr(getFormattedTimestamp());
    setPaymentType('Receive');
    setFromAccount('Debtors');
    setToAccount('Cash In Hand');
    setPaymentMethod('Cash');
    setClearanceDate('');
    setChequeNo('');
    setRefDate('');
    setAmount(0);
    setWriteOff(0);
    setAttachmentName('');
    setAllocations([{ type: 'SalesInvoice', name: '', amount: 0 }]);
    setReferenceNumber('');
    setForInvoice('');
    setNotes('');
    setStatus('Submitted');
    setDetailsOpen(true);
    setAmountsOpen(true);
    setReferencesOpen(true);
    if (parties.length > 0) setParty(parties[0].name);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!party) {
      showToast('Please select a customer.', 'error');
      return;
    }
    if (amount <= 0) {
      showToast('Payment amount must be greater than 0.', 'error');
      return;
    }

    try {
      const payload = {
        party,
        paymentType: 'Receive' as const,
        paymentMethod,
        paymentAccount: toAccount,
        account: fromAccount || 'Debtors',
        date,
        amount: Number(amount),
        referenceNumber,
        notes,
        forInvoice: forInvoice || undefined,
      };

      const result = await acmasoService.createSalesPayment(payload);
      showToast(`Payment receipt ${result.paymentNumber || result.id} recorded successfully!`, 'success');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Record payment failed: ${err.message}`, 'error');
    }
  }

  async function handleDelete(payment: SalesPayment) {
    if (!window.confirm(`Delete receipt ${payment.paymentNumber}? This will revert the bank balance and restore the unpaid amount on any allocated invoices.`))
      return;
    try {
      await acmasoService.deleteSalesPayment(payment.id);
      showToast(`Payment receipt ${payment.paymentNumber} deleted.`, 'info');
      setViewingPayment(null);
      loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
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
    link.setAttribute('download', `sales_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const customerUnpaidInvoices = useMemo(() => {
    return invoices.filter((i) => i.party === party && i.status !== 'Cancelled' && (i.outstandingAmount || 0) > 0);
  }, [invoices, party]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.party.toLowerCase().includes(search.toLowerCase()) ||
        (p.referenceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(search.toLowerCase());

      const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [payments, search, methodFilter]);

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

          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Sales Payments</h1>

          {showSearchInput && (
            <div style={{ position: 'relative', width: 220, marginLeft: 8 }}>
              <Input
                type="text"
                placeholder="Type to filter payments..."
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
            onClick={handleOpenCreate}
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
            title="Make Entry (New Payment)"
          >
            <i className="fas fa-plus" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {/* Main Table / Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader label="Loading payments received..." />
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
            onClick={handleOpenCreate}
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
              {paginatedPayments.map((p, idx) => {
                const globalIndex = pageSize === 'All' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setViewingPayment(p)}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{globalIndex}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{p.paymentNumber || p.id}</td>
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
                        {p.status || 'Submitted'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{p.party}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.date}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                      ₹ {Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Payment Detail Modal */}
      {viewingPayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>PAYMENT RECEIPT</span>
                <h3 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{viewingPayment.paymentNumber || viewingPayment.id}</h3>
                <span style={{ fontSize: 13, color: '#64748b' }}>Received from: <strong>{viewingPayment.party}</strong></span>
              </div>
              <button onClick={() => setViewingPayment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Posting Date</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{viewingPayment.date}</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#16a34a' }}>Amount Received</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>₹{Number(viewingPayment.amount).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Payment Mode</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{viewingPayment.paymentMethod}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Deposit Account</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{viewingPayment.paymentAccount}</div>
              </div>
            </div>

            {viewingPayment.referenceNumber && (
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 12.5 }}>
                <strong>Reference / UTR #:</strong> {viewingPayment.referenceNumber}
              </div>
            )}

            {viewingPayment.notes && (
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 12.5 }}>
                <strong>Notes:</strong> {viewingPayment.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => handleDelete(viewingPayment)}
              >
                <i className="fas fa-trash-alt" style={{ marginRight: 6 }} /> Delete Receipt
              </Button>
              <Button variant="outline" onClick={() => setViewingPayment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Payment Modal (Exact Frappe Books New Entry UI) */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '24px 16px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 780,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              margin: 'auto 0',
            }}
          >
            {/* Header: New Entry + Draft Pill */}
            <div
              style={{
                padding: '20px 24px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: 6,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                  title="Close"
                >
                  <i className="fas fa-times" style={{ fontSize: 13 }} />
                </button>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
                  New Entry
                </h2>
              </div>

              <span
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  padding: '4px 14px',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                {status === 'Draft' ? 'Draft' : 'Draft'}
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 24px 20px' }}>
              {/* Row 1: Number Series & Party */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                {/* Number Series */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Number Series
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '0 14px',
                      height: 44,
                      background: '#ffffff',
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{numberSeries}</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#94a3b8' }} />
                  </div>
                </div>

                {/* Party */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Party
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={party}
                      onChange={(e) => {
                        setParty(e.target.value);
                        setForInvoice('');
                      }}
                      style={{
                        width: '100%',
                        height: 44,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        padding: '0 36px 0 14px',
                        fontSize: 14,
                        color: party ? '#1e293b' : '#94a3b8',
                        background: '#ffffff',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" disabled>Party</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <div
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#ef4444',
                        fontSize: 10,
                        lineHeight: '10px',
                      }}
                    >
                      <span>▲</span>
                      <span>▼</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Posting Date & Payment Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
                {/* Posting Date */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Posting Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      placeholder="Sep 15, 2026 10:56:24"
                      style={{
                        width: '100%',
                        height: 44,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        padding: '0 36px 0 14px',
                        fontSize: 14,
                        color: '#1e293b',
                        background: '#ffffff',
                      }}
                    />
                    <i
                      className="far fa-calendar"
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontSize: 14,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Payment Type */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Payment Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as any)}
                      style={{
                        width: '100%',
                        height: 44,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        padding: '0 36px 0 14px',
                        fontSize: 14,
                        color: '#1e293b',
                        background: '#ffffff',
                        appearance: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Receive">Receive</option>
                      <option value="Pay">Pay</option>
                    </select>
                    <div
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#ef4444',
                        fontSize: 10,
                        lineHeight: '10px',
                      }}
                    >
                      <span>▲</span>
                      <span>▼</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Section 1: Details */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: detailsOpen ? 14 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Details</h3>
                  <i
                    className={`fas fa-chevron-${detailsOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {detailsOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* From Account & To Account */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          From Account
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={fromAccount}
                            onChange={(e) => setFromAccount(e.target.value)}
                            style={{
                              width: '100%',
                              height: 44,
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              padding: '0 36px 0 14px',
                              fontSize: 14,
                              color: '#1e293b',
                              background: '#ffffff',
                              appearance: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Debtors">Debtors</option>
                            <option value="Accounts Receivable">Accounts Receivable</option>
                            <option value="Customer Account">Customer Account</option>
                          </select>
                          <div
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              color: '#ef4444',
                              fontSize: 10,
                              lineHeight: '10px',
                            }}
                          >
                            <span>▲</span>
                            <span>▼</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          To Account
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={toAccount}
                            onChange={(e) => setToAccount(e.target.value)}
                            style={{
                              width: '100%',
                              height: 44,
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              padding: '0 36px 0 14px',
                              fontSize: 14,
                              color: '#1e293b',
                              background: '#ffffff',
                              appearance: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Cash In Hand">Cash In Hand</option>
                            <option value="HDFC Bank Operating A/c">HDFC Bank Operating A/c</option>
                            <option value="ICICI Bank Current A/c">ICICI Bank Current A/c</option>
                            <option value="Bank Account">Bank Account</option>
                          </select>
                          <div
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              color: '#ef4444',
                              fontSize: 10,
                              lineHeight: '10px',
                            }}
                          >
                            <span>▲</span>
                            <span>▼</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method & Clearance Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Payment Method
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            padding: '0 14px',
                            height: 44,
                            background: '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{
                              border: 'none',
                              outline: 'none',
                              width: '100%',
                              fontSize: 14,
                              color: '#1e293b',
                              fontWeight: 500,
                              background: 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer (NEFT/RTGS/IMPS)">Bank Transfer</option>
                            <option value="UPI / Online QR">UPI / QR</option>
                            <option value="Cheque / Draft">Cheque / Draft</option>
                            <option value="Credit / Debit Card">Credit / Debit Card</option>
                          </select>
                          <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#94a3b8' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Clearance Date
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={clearanceDate}
                            onChange={(e) => setClearanceDate(e.target.value)}
                            placeholder="Clearance Date"
                            style={{
                              width: '100%',
                              height: 44,
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              padding: '0 36px 0 14px',
                              fontSize: 14,
                              color: '#1e293b',
                              background: '#ffffff',
                            }}
                          />
                          <i
                            className="far fa-calendar"
                            style={{
                              position: 'absolute',
                              right: 14,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#94a3b8',
                              fontSize: 14,
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ref. / Cheque No. & Reference Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Ref. / Cheque No.
                        </label>
                        <input
                          type="text"
                          value={chequeNo || referenceNumber}
                          onChange={(e) => {
                            setChequeNo(e.target.value);
                            setReferenceNumber(e.target.value);
                          }}
                          placeholder="Ref. / Cheque No."
                          style={{
                            width: '100%',
                            height: 44,
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            padding: '0 14px',
                            fontSize: 14,
                            color: '#1e293b',
                            background: '#ffffff',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Reference Date
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={refDate}
                            onChange={(e) => setRefDate(e.target.value)}
                            placeholder="Ref. Date"
                            style={{
                              width: '100%',
                              height: 44,
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              padding: '0 36px 0 14px',
                              fontSize: 14,
                              color: '#1e293b',
                              background: '#ffffff',
                            }}
                          />
                          <i
                            className="far fa-calendar"
                            style={{
                              position: 'absolute',
                              right: 14,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#94a3b8',
                              fontSize: 14,
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Section 2: Amounts */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setAmountsOpen(!amountsOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: amountsOpen ? 14 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Amounts</h3>
                  <i
                    className={`fas fa-chevron-${amountsOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {amountsOpen && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    {/* Amount */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Amount
                      </label>
                      <div
                        style={{
                          width: '100%',
                          height: 44,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 16px',
                        }}
                      >
                        <span style={{ fontSize: 14, color: '#64748b' }}>₹</span>
                        <input
                          type="number"
                          min={0}
                          value={amount || ''}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          placeholder="0.00"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'right',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1e293b',
                            width: '100%',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Write Off */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Write Off
                      </label>
                      <div
                        style={{
                          width: '100%',
                          height: 44,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 16px',
                        }}
                      >
                        <span style={{ fontSize: 14, color: '#64748b' }}>₹</span>
                        <input
                          type="number"
                          min={0}
                          value={writeOff || ''}
                          onChange={(e) => setWriteOff(Number(e.target.value))}
                          placeholder="0.00"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'right',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1e293b',
                            width: '100%',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Section 3: References */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 24 }}>
                <div
                  onClick={() => setReferencesOpen(!referencesOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: referencesOpen ? 14 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>References</h3>
                  <i
                    className={`fas fa-chevron-${referencesOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {referencesOpen && (
                  <div>
                    {/* Payment Reference Table */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Payment Reference
                      </label>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                              <th style={{ padding: '10px 14px', textAlign: 'left', width: 40, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>#</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', width: 140, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Type</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Name</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right', width: 140, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Amount</th>
                              <th style={{ width: 36 }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {allocations.map((al, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{idx + 1}</td>
                                <td style={{ padding: '8px 14px' }}>
                                  <select
                                    value={al.type}
                                    onChange={(e) => {
                                      const next = [...allocations];
                                      next[idx].type = e.target.value;
                                      setAllocations(next);
                                    }}
                                    style={{
                                      width: '100%',
                                      height: 36,
                                      borderRadius: 6,
                                      border: '1px solid #e2e8f0',
                                      padding: '0 8px',
                                      fontSize: 13,
                                      background: '#fff',
                                    }}
                                  >
                                    <option value="SalesInvoice">Sales Invoice</option>
                                    <option value="SalesQuote">Sales Quote</option>
                                  </select>
                                </td>
                                <td style={{ padding: '8px 14px' }}>
                                  <select
                                    value={al.name}
                                    onChange={(e) => {
                                      const next = [...allocations];
                                      next[idx].name = e.target.value;
                                      const matched = customerUnpaidInvoices.find((i) => i.invoiceNumber === e.target.value || i.id === e.target.value);
                                      if (matched) {
                                        next[idx].amount = matched.outstandingAmount;
                                        setAmount(matched.outstandingAmount);
                                        setForInvoice(matched.invoiceNumber || matched.id);
                                      }
                                      setAllocations(next);
                                    }}
                                    style={{
                                      width: '100%',
                                      height: 36,
                                      borderRadius: 6,
                                      border: '1px solid #e2e8f0',
                                      padding: '0 8px',
                                      fontSize: 13,
                                      background: '#fff',
                                    }}
                                  >
                                    <option value="">Select Invoice / Ref...</option>
                                    {customerUnpaidInvoices.map((i) => (
                                      <option key={i.id} value={i.invoiceNumber || i.id}>
                                        {i.invoiceNumber} (₹{Number(i.outstandingAmount).toLocaleString('en-IN')})
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td style={{ padding: '8px 14px' }}>
                                  <input
                                    type="number"
                                    min={0}
                                    value={al.amount || ''}
                                    onChange={(e) => {
                                      const next = [...allocations];
                                      next[idx].amount = Number(e.target.value);
                                      setAllocations(next);
                                      setAmount(Number(e.target.value));
                                    }}
                                    placeholder="0.00"
                                    style={{
                                      width: '100%',
                                      height: 36,
                                      borderRadius: 6,
                                      border: '1px solid #e2e8f0',
                                      padding: '0 8px',
                                      textAlign: 'right',
                                      fontSize: 13,
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                  {allocations.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setAllocations(allocations.filter((_, i) => i !== idx))}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                      <i className="fas fa-trash-alt" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
                          <button
                            type="button"
                            onClick={() => setAllocations([...allocations, { type: 'SalesInvoice', name: '', amount: 0 }])}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <i className="fas fa-plus" style={{ fontSize: 11 }} /> Add Row
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Attachment */}
                    <div style={{ maxWidth: 'calc(50% - 9px)' }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Attachment
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          height: 44,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          padding: '0 14px',
                          fontSize: 13.5,
                          color: attachmentName ? '#1e293b' : '#94a3b8',
                          cursor: 'pointer',
                          background: '#ffffff',
                        }}
                      >
                        <span>{attachmentName || 'Add attachment'}</span>
                        <i className="fas fa-arrow-up-from-bracket" style={{ color: '#94a3b8', fontSize: 14 }} />
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAttachmentName(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons at bottom */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                  paddingTop: 16,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    setStatus('Draft');
                    handleSubmit(e);
                  }}
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#1e293b',
                    cursor: 'pointer',
                  }}
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  onClick={() => setStatus('Submitted')}
                  style={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Make Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPayments;
