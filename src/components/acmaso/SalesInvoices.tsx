import React, { useEffect, useState, useMemo } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { SalesInvoice, Party, Item, TaxTemplate } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';
import { InvoicePrintModal } from './InvoicePrintModal';

interface FormLineItem {
  item: string;
  name: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  account: string;
}

export const SalesInvoices: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [_taxTemplates, setTaxTemplates] = useState<TaxTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Draft' | 'Cancelled'>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Partially Paid' | 'Unpaid'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'All'>(50);

  // Modals & Details
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<SalesInvoice | null>(null);
  const [activePrintDoc, setActivePrintDoc] = useState<SalesInvoice | null>(null);

  // Form State
  const [party, setParty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateStr, setDateStr] = useState('');
  const [numberSeries, setNumberSeries] = useState('SINV-');
  const [account, setAccount] = useState('Debtors');
  const [attachmentName, setAttachmentName] = useState('');
  const [returnAgainst, setReturnAgainst] = useState('');
  const [coupons, setCoupons] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Submitted' | 'Draft'>('Submitted');
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { item: '', name: '', quantity: 1, rate: 0, discountPercent: 0, discountAmount: 0, taxRate: 18, account: 'Sales' },
  ]);

  // Record Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<SalesInvoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState('Bank Transfer (NEFT/RTGS/IMPS)');
  const [payAccount, setPayAccount] = useState('HDFC Bank Operating A/c');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Collapsible Sections
  const [itemsOpen, setItemsOpen] = useState(true);
  const [taxOpen, setTaxOpen] = useState(true);
  const [outstandingOpen, setOutstandingOpen] = useState(true);
  const [referencesOpen, setReferencesOpen] = useState(true);
  const [couponsOpen, setCouponsOpen] = useState(true);

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
      const [invoicesRes, partiesRes, itemsRes, taxRes] = await Promise.all([
        acmasoService.getSalesInvoices(),
        acmasoService.getParties('Customer'),
        acmasoService.getItems(),
        acmasoService.getTaxTemplates(),
      ]);
      setInvoices(invoicesRes || []);
      setParties(partiesRes || []);
      setItems(itemsRes || []);
      setTaxTemplates(taxRes || []);
      if (partiesRes.length > 0 && !party) {
        setParty(partiesRes[0].name);
        setPlaceOfSupply(partiesRes[0].placeOfSupply || 'Maharashtra');
      }
    } catch {
      showToast('Failed to load sales invoices from database.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingInvoice(null);
    setNumberSeries('SINV-');
    setAccount('Debtors');
    setDate(new Date().toISOString().split('T')[0]);
    setDateStr(getFormattedTimestamp());
    setAttachmentName('');
    setReturnAgainst('');
    setCoupons([]);
    setDueDate('');
    setNotes('');
    setStatus('Submitted');
    setItemsOpen(true);
    setTaxOpen(true);
    setOutstandingOpen(true);
    setReferencesOpen(true);
    setCouponsOpen(true);
    if (parties.length > 0) {
      setParty(parties[0].name);
      setPlaceOfSupply(parties[0].placeOfSupply || 'Maharashtra');
    }
    setLineItems([
      { item: '', name: '', quantity: 1, rate: 0, discountPercent: 0, discountAmount: 0, taxRate: 18, account: 'Sales' },
    ]);
    setShowCreateModal(true);
  }

  function handleOpenEdit(inv: SalesInvoice) {
    setEditingInvoice(inv);
    setNumberSeries(inv.invoiceNumber ? inv.invoiceNumber.split('-')[0] + '-' : 'SINV-');
    setAccount(inv.account || 'Debtors');
    setParty(inv.party);
    setDate(inv.date);
    setDateStr(inv.date || getFormattedTimestamp());
    setAttachmentName('');
    setReturnAgainst('');
    setCoupons([]);
    setDueDate(inv.dueDate || '');
    setPlaceOfSupply(inv.placeOfSupply || 'Maharashtra');
    setNotes(inv.notes || '');
    setStatus(inv.status === 'Draft' ? 'Draft' : 'Submitted');
    setItemsOpen(true);
    setTaxOpen(true);
    setOutstandingOpen(true);
    setReferencesOpen(true);
    setCouponsOpen(true);
    if (inv.items && inv.items.length > 0) {
      setLineItems(
        inv.items.map((it) => ({
          item: it.item || it.name,
          name: it.name || it.item,
          quantity: it.quantity || 1,
          rate: it.rate || 0,
          discountPercent: it.discountPercent || 0,
          discountAmount: it.discountAmount || 0,
          taxRate: it.taxRate ?? 18,
          account: it.account || 'Sales',
        }))
      );
    }
    setShowCreateModal(true);
  }

  function handleAddItemRow() {
    setLineItems([
      ...lineItems,
      { item: '', name: '', quantity: 1, rate: 0, discountPercent: 0, discountAmount: 0, taxRate: 18, account: 'Sales' },
    ]);
  }

  function handleRemoveItemRow(idx: number) {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  }

  function handleItemChange(idx: number, itemCodeOrName: string) {
    const selected = items.find((it) => it.code === itemCodeOrName || it.name === itemCodeOrName);
    const updated = [...lineItems];
    if (selected) {
      updated[idx] = {
        ...updated[idx],
        item: selected.code,
        name: selected.name,
        rate: selected.rate || 0,
        taxRate: selected.taxRate ?? 18,
        account: selected.incomeAccount || 'Sales',
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        item: itemCodeOrName,
        name: itemCodeOrName,
      };
    }
    setLineItems(updated);
  }

  function handleRowFieldChange(idx: number, field: keyof FormLineItem, val: any) {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: val };

    if (field === 'discountPercent') {
      const raw = (Number(updated[idx].quantity) || 0) * (Number(updated[idx].rate) || 0);
      updated[idx].discountAmount = (raw * (Number(val) || 0)) / 100;
    } else if (field === 'discountAmount') {
      const raw = (Number(updated[idx].quantity) || 0) * (Number(updated[idx].rate) || 0);
      updated[idx].discountPercent = raw > 0 ? ((Number(val) || 0) / raw) * 100 : 0;
    }

    setLineItems(updated);
  }

  const totals = useMemo(() => {
    let netTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    lineItems.forEach((li) => {
      const raw = (Number(li.quantity) || 0) * (Number(li.rate) || 0);
      const discPct = Number(li.discountPercent) || 0;
      const discAmt = Number(li.discountAmount) || (raw * discPct) / 100;
      const taxable = Math.max(0, raw - discAmt);
      const tax = (taxable * (Number(li.taxRate) || 0)) / 100;

      netTotal += taxable;
      discountTotal += discAmt;
      taxTotal += tax;
    });

    return {
      netTotal,
      discountTotal,
      taxTotal,
      grandTotal: netTotal + taxTotal,
    };
  }, [lineItems]);

  async function handleSaveInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!party) {
      showToast('Please select a customer.', 'error');
      return;
    }
    if (lineItems.some((l) => !l.item && !l.name)) {
      showToast('Please select an item for all item rows.', 'error');
      return;
    }

    try {
      const processedItems = lineItems.map((li) => {
        const qty = Number(li.quantity) || 1;
        const rate = Number(li.rate) || 0;
        const raw = qty * rate;
        const discPct = Number(li.discountPercent) || 0;
        const discAmt = Number(li.discountAmount) || (raw * discPct) / 100;
        const taxable = Math.max(0, raw - discAmt);
        const taxRate = Number(li.taxRate) || 18;
        const taxAmt = (taxable * taxRate) / 100;

        return {
          item: li.item || li.name,
          name: li.name || li.item,
          quantity: qty,
          rate,
          discountPercent: discPct,
          discountAmount: discAmt,
          amount: taxable,
          taxRate,
          taxAmount: taxAmt,
          total: taxable + taxAmt,
          account: li.account || 'Sales',
        };
      });

      const payload = {
        party,
        date,
        dueDate,
        placeOfSupply,
        notes,
        status,
        account: 'Debtors',
        items: processedItems,
      };

      if (editingInvoice) {
        const updated = await acmasoService.updateSalesInvoice(editingInvoice.id, payload);
        showToast(`Invoice ${updated.invoiceNumber} updated successfully!`, 'success');
      } else {
        const created = await acmasoService.createSalesInvoice(payload);
        showToast(`Sales invoice ${created.invoiceNumber} created successfully!`, 'success');
      }

      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Save invoice failed: ${err.message}`, 'error');
    }
  }

  function handleOpenRecordPayment(inv: SalesInvoice) {
    setPaymentInvoice(inv);
    setPayAmount(inv.outstandingAmount || inv.grandTotal);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayRef('');
    setPayNotes(`Payment received for invoice ${inv.invoiceNumber}`);
    setShowPaymentModal(true);
  }

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentInvoice) return;
    if (payAmount <= 0) {
      showToast('Payment amount must be greater than 0.', 'error');
      return;
    }
    if (payAmount > paymentInvoice.outstandingAmount) {
      showToast(`Payment cannot exceed outstanding amount of ₹${paymentInvoice.outstandingAmount.toLocaleString('en-IN')}.`, 'error');
      return;
    }

    try {
      await acmasoService.createSalesPayment({
        party: paymentInvoice.party,
        paymentType: 'Receive',
        paymentMethod: payMethod,
        paymentAccount: payAccount,
        account: 'Debtors',
        date: payDate,
        amount: Number(payAmount),
        referenceNumber: payRef,
        notes: payNotes,
        invoiceNumber: paymentInvoice.invoiceNumber,
        invoiceId: paymentInvoice.id,
        for: [
          {
            referenceType: 'SalesInvoice',
            referenceName: paymentInvoice.invoiceNumber || paymentInvoice.id,
            amount: Number(payAmount),
          },
        ],
      });

      showToast(`Payment of ₹${Number(payAmount).toLocaleString('en-IN')} recorded against invoice ${paymentInvoice.invoiceNumber}.`, 'success');
      setShowPaymentModal(false);
      setViewingInvoice(null);
      loadData();
    } catch (err: any) {
      showToast(`Record payment failed: ${err.message}`, 'error');
    }
  }

  async function handleCancelInvoice(invoice: SalesInvoice) {
    if (!window.confirm(`Are you sure you want to cancel invoice ${invoice.invoiceNumber}? This will revert its double-entry ledger postings.`))
      return;
    try {
      await acmasoService.cancelSalesInvoice(invoice.id);
      showToast(`Invoice ${invoice.invoiceNumber} cancelled and ledger entries reverted.`, 'info');
      setViewingInvoice(null);
      loadData();
    } catch (err: any) {
      showToast(`Cancellation failed: ${err.message}`, 'error');
    }
  }

  async function handleDeleteInvoice(invoice: SalesInvoice) {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    try {
      await acmasoService.deleteSalesInvoice(invoice.id);
      showToast(`Invoice ${invoice.invoiceNumber} deleted.`, 'info');
      setViewingInvoice(null);
      loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  function handleExportCsv() {
    if (invoices.length === 0) {
      showToast('No invoices to export.', 'info');
      return;
    }
    const headers = ['#', 'Invoice No', 'Status', 'Customer', 'Date', 'Base Grand Total', 'Outstanding Amount'];
    const rows = filtered.map((inv, idx) => [
      idx + 1,
      inv.invoiceNumber || inv.id,
      inv.paymentStatus,
      inv.party,
      inv.date,
      inv.grandTotal,
      inv.outstandingAmount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = useMemo(() => {
    return invoices.filter((i) => {
      const matchSearch =
        i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        i.party.toLowerCase().includes(search.toLowerCase()) ||
        (i.notes || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || i.status === statusFilter;
      const matchPayment = paymentFilter === 'All' || i.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [invoices, search, statusFilter, paymentFilter]);

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

          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Sales Invoice</h1>

          {showSearchInput && (
            <div style={{ position: 'relative', width: 220, marginLeft: 8 }}>
              <Input
                type="text"
                placeholder="Type to filter invoices..."
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
                background: paymentFilter !== 'All' || statusFilter !== 'All' ? '#e2e8f0' : '#f1f5f9',
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
                  width: 200,
                  padding: 8,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 8px' }}>INVOICE STATUS</div>
                {(['All', 'Submitted', 'Draft', 'Cancelled'] as const).map((st) => (
                  <div
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '6px 8px',
                      fontSize: 13,
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
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '6px 8px 4px', borderTop: '1px solid #f1f5f9', marginTop: 4 }}>PAYMENT STATUS</div>
                {(['All', 'Paid', 'Partially Paid', 'Unpaid'] as const).map((ps) => (
                  <div
                    key={ps}
                    onClick={() => {
                      setPaymentFilter(ps);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '6px 8px',
                      fontSize: 13,
                      cursor: 'pointer',
                      borderRadius: 4,
                      background: paymentFilter === ps ? '#f1f5f9' : 'transparent',
                      fontWeight: paymentFilter === ps ? 600 : 400,
                      color: '#1e293b',
                    }}
                  >
                    {ps}
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
            title="Make Entry (New Sales Invoice)"
          >
            <i className="fas fa-plus" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {/* Main Table / Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader label="Loading sales invoices..." />
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Invoice No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Customer</th>
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
                    onClick={() => setViewingInvoice(inv)}
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
                          background:
                            inv.paymentStatus === 'Paid'
                              ? '#dcfce7'
                              : inv.paymentStatus === 'Partially Paid'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            inv.paymentStatus === 'Paid'
                              ? '#16a34a'
                              : inv.paymentStatus === 'Partially Paid'
                              ? '#d97706'
                              : '#ea580c',
                          padding: '3px 10px',
                          borderRadius: 14,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{inv.party}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{inv.date}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                      ₹ {Number(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: inv.outstandingAmount > 0 ? '#1e293b' : '#64748b' }}>
                      ₹ {Number(inv.outstandingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Invoice Detail Drawer / Modal */}
      {viewingInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>SALES INVOICE</span>
                <h3 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{viewingInvoice.invoiceNumber}</h3>
                <span style={{ fontSize: 13, color: '#64748b' }}>Customer: <strong>{viewingInvoice.party}</strong></span>
              </div>
              <button onClick={() => setViewingInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Invoice Date</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{viewingInvoice.date}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Due Date</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{viewingInvoice.dueDate || '—'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Payment Status</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: viewingInvoice.paymentStatus === 'Paid' ? '#16a34a' : '#ea580c' }}>{viewingInvoice.paymentStatus}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Outstanding</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: viewingInvoice.outstandingAmount > 0 ? '#dc2626' : '#16a34a' }}>
                  ₹{Number(viewingInvoice.outstandingAmount).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Line Items</h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tax Rate</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingInvoice.items || []).map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{it.name || it.item}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>{it.quantity}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{Number(it.rate).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>{it.taxRate ?? 18}%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>₹{Number(it.total || it.amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={() => handleCancelInvoice(viewingInvoice)}
                >
                  <i className="fas fa-ban" style={{ marginRight: 6 }} /> Cancel Invoice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  onClick={() => handleDeleteInvoice(viewingInvoice)}
                >
                  <i className="fas fa-trash" style={{ marginRight: 6 }} /> Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const inv = viewingInvoice;
                    setViewingInvoice(null);
                    handleOpenEdit(inv);
                  }}
                >
                  <i className="fas fa-edit" style={{ marginRight: 6 }} /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePrintDoc(viewingInvoice)}
                >
                  <i className="fas fa-print" style={{ marginRight: 6 }} /> Print
                </Button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="outline" onClick={() => setViewingInvoice(null)}>Close</Button>
                {viewingInvoice.outstandingAmount > 0 && (
                  <Button variant="primary" onClick={() => handleOpenRecordPayment(viewingInvoice)}>
                    <i className="fas fa-money-bill-transfer" style={{ marginRight: 6 }} /> Record Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && paymentInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Record Payment</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Against {paymentInvoice.invoiceNumber} ({paymentInvoice.party})</span>
              </div>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Amount (₹) *</label>
                <Input
                  type="number"
                  min={1}
                  max={paymentInvoice.outstandingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  style={{ width: '100%', height: 38, fontSize: 15, fontWeight: 800 }}
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>Maximum outstanding: ₹{Number(paymentInvoice.outstandingAmount).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Payment Date</label>
                  <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Payment Mode</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
                  >
                    <option value="Bank Transfer (NEFT/RTGS/IMPS)">Bank Transfer</option>
                    <option value="UPI / Online QR">UPI / QR</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque / Draft">Cheque</option>
                    <option value="Credit / Debit Card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Deposit Account</label>
                <select
                  value={payAccount}
                  onChange={(e) => setPayAccount(e.target.value)}
                  style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 8px', fontSize: 12.5 }}
                >
                  <option value="HDFC Bank Operating A/c">HDFC Bank Operating A/c</option>
                  <option value="ICICI Bank Current A/c">ICICI Bank Current A/c</option>
                  <option value="Cash In Hand">Cash In Hand</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Reference # / UTR</label>
                <Input type="text" placeholder="UTR or Transaction Reference" value={payRef} onChange={(e) => setPayRef(e.target.value)} style={{ width: '100%', height: 38 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">
                  <i className="fas fa-check" style={{ marginRight: 6 }} /> Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Invoice Modal (Exact Frappe Books New Entry UI) */}
      {showCreateModal && (
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
                  onClick={() => setShowCreateModal(false)}
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
                  {editingInvoice ? `Edit Entry: ${editingInvoice.invoiceNumber}` : 'New Entry'}
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

            <form onSubmit={handleSaveInvoice} style={{ padding: '24px 24px 20px' }}>
              {/* Row 1: Number Series & Customer */}
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

                {/* Customer */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Customer
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={party}
                      onChange={(e) => {
                        setParty(e.target.value);
                        const selected = parties.find((p) => p.name === e.target.value);
                        if (selected?.placeOfSupply) setPlaceOfSupply(selected.placeOfSupply);
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
                      <option value="" disabled>Customer</option>
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

              {/* Row 2: Account & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
                {/* Account */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Account
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
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
                      <option value="Cash In Hand">Cash In Hand</option>
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

                {/* Date */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      placeholder="Sep 15, 2026 10:52:16"
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

              {/* Collapsible Section 1: Items */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setItemsOpen(!itemsOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: itemsOpen ? 12 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Items</h3>
                  <i
                    className={`fas fa-chevron-${itemsOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {itemsOpen && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Items
                    </label>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ padding: '10px 14px', textAlign: 'left', width: 36, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>#</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Item</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', width: 130, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Tax</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', width: 80, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Qty</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', width: 110, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Rate</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', width: 120, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Amount</th>
                            <th style={{ width: 36 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((li, idx) => {
                            const qty = Number(li.quantity) || 0;
                            const rate = Number(li.rate) || 0;
                            const rowTotal = qty * rate;

                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{idx + 1}</td>
                                <td style={{ padding: '8px 14px' }}>
                                  <select
                                    value={li.item}
                                    onChange={(e) => handleItemChange(idx, e.target.value)}
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
                                    <option value="">Select Item...</option>
                                    {items.map((it) => (
                                      <option key={it.id} value={it.code}>
                                        {it.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td style={{ padding: '8px 14px' }}>
                                  <select
                                    value={li.taxRate}
                                    onChange={(e) => handleRowFieldChange(idx, 'taxRate', Number(e.target.value))}
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
                                    <option value={18}>GST-18</option>
                                    <option value={12}>GST-12</option>
                                    <option value={5}>GST-5</option>
                                    <option value={0}>0%</option>
                                  </select>
                                </td>
                                <td style={{ padding: '8px 14px' }}>
                                  <input
                                    type="number"
                                    min={1}
                                    value={li.quantity}
                                    onChange={(e) => handleRowFieldChange(idx, 'quantity', Number(e.target.value))}
                                    style={{
                                      width: '100%',
                                      height: 36,
                                      borderRadius: 6,
                                      border: '1px solid #e2e8f0',
                                      padding: '0 6px',
                                      textAlign: 'right',
                                      fontSize: 13,
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '8px 14px' }}>
                                  <input
                                    type="number"
                                    value={li.rate}
                                    onChange={(e) => handleRowFieldChange(idx, 'rate', Number(e.target.value))}
                                    style={{
                                      width: '100%',
                                      height: 36,
                                      borderRadius: 6,
                                      border: '1px solid #e2e8f0',
                                      padding: '0 6px',
                                      textAlign: 'right',
                                      fontSize: 13,
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                  ₹ {rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                  {lineItems.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItemRow(idx)}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                      <i className="fas fa-trash-alt" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
                        <button
                          type="button"
                          onClick={handleAddItemRow}
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

                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Net Total
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
                          justifyContent: 'flex-end',
                          padding: '0 16px',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#1e293b',
                        }}
                      >
                        ₹ {totals.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Section 2: Tax and Totals */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setTaxOpen(!taxOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: taxOpen ? 12 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Tax and Totals</h3>
                  <i
                    className={`fas fa-chevron-${taxOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {taxOpen && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Grand Total
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
                        justifyContent: 'flex-end',
                        padding: '0 16px',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      ₹ {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Section 3: Outstanding */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setOutstandingOpen(!outstandingOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: outstandingOpen ? 12 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Outstanding</h3>
                  <i
                    className={`fas fa-chevron-${outstandingOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {outstandingOpen && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Outstanding Amount
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
                          justifyContent: 'flex-end',
                          padding: '0 16px',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1e293b',
                        }}
                      >
                        ₹ {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Stock Not Shipped
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
                          justifyContent: 'flex-end',
                          padding: '0 16px',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#1e293b',
                        }}
                      >
                        0
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Section 4: References */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setReferencesOpen(!referencesOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: referencesOpen ? 12 : 0,
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 16 }}>
                      {/* Notes */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Notes
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add invoice terms"
                          rows={3}
                          style={{
                            width: '100%',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            padding: '10px 14px',
                            fontSize: 13.5,
                            color: '#1e293b',
                            resize: 'none',
                            background: '#ffffff',
                          }}
                        />
                      </div>

                      {/* Attachment */}
                      <div>
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

                    {/* Return Against */}
                    <div style={{ maxWidth: 'calc(50% - 9px)' }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Return Against
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={returnAgainst}
                          onChange={(e) => setReturnAgainst(e.target.value)}
                          style={{
                            width: '100%',
                            height: 44,
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            padding: '0 36px 0 14px',
                            fontSize: 14,
                            color: returnAgainst ? '#1e293b' : '#94a3b8',
                            background: '#ffffff',
                            appearance: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">Return Against</option>
                          {invoices.map((inv) => (
                            <option key={inv.id} value={inv.invoiceNumber || inv.id}>
                              {inv.invoiceNumber || inv.id} ({inv.party} - ₹{inv.grandTotal})
                            </option>
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
                            color: '#94a3b8',
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
                )}
              </div>

              {/* Collapsible Section 5: Coupons */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 24 }}>
                <div
                  onClick={() => setCouponsOpen(!couponsOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: couponsOpen ? 12 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Coupons</h3>
                  <i
                    className={`fas fa-chevron-${couponsOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {couponsOpen && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Coupons
                    </label>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ padding: '10px 14px', textAlign: 'left', width: 40, color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>#</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 500, fontSize: 12.5 }}>Coupons</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map((c, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                              <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{i + 1}</td>
                              <td style={{ padding: '8px 14px' }}>
                                <input
                                  type="text"
                                  value={c}
                                  onChange={(e) => {
                                    const next = [...coupons];
                                    next[i] = e.target.value;
                                    setCoupons(next);
                                  }}
                                  placeholder="Enter coupon code..."
                                  style={{
                                    width: '100%',
                                    height: 36,
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    padding: '0 8px',
                                    fontSize: 13,
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
                        <button
                          type="button"
                          onClick={() => setCoupons([...coupons, ''])}
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
                  onClick={() => setShowCreateModal(false)}
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
                    handleSaveInvoice(e);
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

      {/* Invoice Print Modal */}
      {activePrintDoc && (
        <InvoicePrintModal document={activePrintDoc} docType="SalesInvoice" onClose={() => setActivePrintDoc(null)} />
      )}
    </div>
  );
};

export default SalesInvoices;
