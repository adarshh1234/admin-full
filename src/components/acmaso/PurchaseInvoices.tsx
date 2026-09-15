import React, { useEffect, useState, useMemo } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { PurchaseInvoice, Party, Item } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';
import { InvoicePrintModal } from './InvoicePrintModal';

interface PurchaseInvoicesProps {
  onRecordPayment?: (invoice: PurchaseInvoice) => void;
}

export const PurchaseInvoices: React.FC<PurchaseInvoicesProps> = ({ onRecordPayment: _onRecordPayment }) => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activePrintDoc, setActivePrintDoc] = useState<PurchaseInvoice | null>(null);

  // Form State
  const [party, setParty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState([
    { item: '', name: '', quantity: 1, rate: 0, taxRate: 18, account: 'Stock In Hand' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [invoicesRes, partiesRes, itemsRes] = await Promise.all([
        acmasoService.getPurchaseInvoices(),
        acmasoService.getParties('Supplier'),
        acmasoService.getItems(),
      ]);
      setInvoices(invoicesRes);
      setParties(partiesRes);
      setItems(itemsRes);
      if (partiesRes.length > 0 && !party) {
        setParty(partiesRes[0].name);
        setPlaceOfSupply(partiesRes[0].placeOfSupply || 'Maharashtra');
      }
    } catch (err: any) {
      showToast('Failed to load purchase invoices.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleAddItemRow() {
    setLineItems([...lineItems, { item: '', name: '', quantity: 1, rate: 0, taxRate: 18, account: 'Stock In Hand' }]);
  }

  function handleItemChange(index: number, itemIdOrCode: string) {
    const selected = items.find((it) => it.id === itemIdOrCode || it.code === itemIdOrCode);
    const updated = [...lineItems];
    if (selected) {
      updated[index] = {
        ...updated[index],
        item: selected.code,
        name: selected.name,
        rate: selected.rate,
        taxRate: selected.taxRate || 18,
        account: selected.expenseAccount || 'Stock In Hand',
      };
    } else {
      updated[index].item = itemIdOrCode;
    }
    setLineItems(updated);
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!party) {
      showToast('Please select a supplier.', 'error');
      return;
    }
    try {
      const payload = {
        party,
        date,
        dueDate,
        placeOfSupply,
        notes,
        status: 'Submitted' as const,
        account: 'Creditors',
        items: lineItems.map((li) => ({
          ...li,
          amount: li.quantity * li.rate,
          taxAmount: (li.quantity * li.rate * li.taxRate) / 100,
          total: (li.quantity * li.rate) * (1 + li.taxRate / 100),
        })),
      };
      const created = await acmasoService.createPurchaseInvoice(payload);
      showToast(`Purchase invoice ${created.invoiceNumber} recorded and posted to ledger!`, 'success');
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Invoice recording failed: ${err.message}`, 'error');
    }
  }



  // Search, Filter & Pagination
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Partially Paid'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'All'>(50);

  function handleExportCsv() {
    if (invoices.length === 0) {
      showToast('No purchase invoices to export.', 'info');
      return;
    }
    const headers = ['#', 'Invoice No', 'Status', 'Supplier', 'Date', 'Base Grand Total', 'Outstanding Amount'];
    const rows = filtered.map((inv, idx) => [
      idx + 1,
      inv.invoiceNumber,
      inv.paymentStatus || 'Paid',
      inv.party,
      inv.date,
      inv.grandTotal,
      inv.outstandingAmount || 0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = useMemo(() => {
    return invoices.filter((i) => {
      const matchSearch =
        i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        i.party.toLowerCase().includes(search.toLowerCase()) ||
        i.status.toLowerCase().includes(search.toLowerCase()) ||
        i.paymentStatus.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || i.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const effectivePageSize = pageSize === 'All' ? filtered.length || 1 : pageSize;
  const totalPages = Math.ceil(filtered.length / effectivePageSize) || 1;
  const paginatedInvoices = useMemo(() => {
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

          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Purchase Invoice</h1>

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
                background: statusFilter !== 'All' ? '#e2e8f0' : '#f1f5f9',
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
                  width: 180,
                  padding: 8,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 8px' }}>PAYMENT STATUS</div>
                {(['All', 'Paid', 'Unpaid', 'Partially Paid'] as const).map((st) => (
                  <div
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '6px 8px',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      borderRadius: 4,
                      background: statusFilter === st ? '#f1f5f9' : 'transparent',
                      fontWeight: statusFilter === st ? 600 : 400,
                      color: '#1e293b',
                    }}
                  >
                    {st}
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
            title="Make Entry (New Purchase Invoice)"
          >
            <i className="fas fa-plus" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {/* Invoices List / Table */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader label="Loading purchase invoices..." />
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Invoice No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Supplier</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Base Grand Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Outstanding Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((inv, idx) => {
                const globalIndex = pageSize === 'All' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => setActivePrintDoc(inv)}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{globalIndex}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          background: inv.paymentStatus === 'Paid' ? '#dcfce7' : inv.paymentStatus === 'Partially Paid' ? '#fef3c7' : '#fee2e2',
                          color: inv.paymentStatus === 'Paid' ? '#16a34a' : inv.paymentStatus === 'Partially Paid' ? '#b45309' : '#dc2626',
                          padding: '3px 10px',
                          borderRadius: 14,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {inv.paymentStatus || 'Paid'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{inv.party}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{inv.date}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                      ₹ {Number(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: inv.outstandingAmount > 0 ? '#dc2626' : '#1e293b' }}>
                      ₹ {Number(inv.outstandingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Create Purchase Invoice Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Record Vendor Purchase Invoice</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Debits Expense/Inventory &amp; Input Tax Credit; Credits Supplier Payable.</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Supplier / Vendor *</label>
                  <select
                    value={party}
                    onChange={(e) => {
                      setParty(e.target.value);
                      const p = parties.find((item) => item.name === e.target.value);
                      if (p?.placeOfSupply) setPlaceOfSupply(p.placeOfSupply);
                    }}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                  >
                    {parties.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Bill Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: '100%', height: 38 }} />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Billed Items &amp; GST Rates</label>
                {lineItems.map((li, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <select
                      value={li.item}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      style={{ height: 36, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
                    >
                      <option value="">-- Select Item --</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.code}>{it.name} (₹{it.rate})</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={li.quantity}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].quantity = Number(e.target.value);
                        setLineItems(updated);
                      }}
                      style={{ height: 36, fontSize: 12.5 }}
                    />
                    <Input
                      type="number"
                      placeholder="Rate"
                      value={li.rate}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].rate = Number(e.target.value);
                        setLineItems(updated);
                      }}
                      style={{ height: 36, fontSize: 12.5 }}
                    />
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', textAlign: 'right', paddingRight: 4 }}>
                      ₹{(li.quantity * li.rate * (1 + li.taxRate / 100)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow} style={{ marginTop: 6, fontSize: 12 }}>
                  <i className="fas fa-plus" style={{ marginRight: 4 }} /> Add Purchase Line
                </Button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Supplier Invoice Reference &amp; Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Supplier bill #, delivery challan details..."
                  rows={2}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Submit Bill &amp; Post to Ledger</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {activePrintDoc && (
        <InvoicePrintModal
          document={activePrintDoc}
          docType="PurchaseInvoice"
          onClose={() => setActivePrintDoc(null)}
        />
      )}
    </div>
  );
};
