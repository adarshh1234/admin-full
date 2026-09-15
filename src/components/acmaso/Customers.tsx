import React, { useEffect, useState, useMemo } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { Party, SalesInvoice, SalesPayment } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const Customers: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Party[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [payments, setPayments] = useState<SalesPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'All'>(50);

  // Modals & Details
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Party | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Party | null>(null);
  const [historyTab, setHistoryTab] = useState<'invoices' | 'payments'>('invoices');

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Customer');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [defaultAccount, setDefaultAccount] = useState('Debtors');
  const [currency, setCurrency] = useState('INR');
  const [gstRegistration, setGstRegistration] = useState('Unregistered');
  const [fromLead, setFromLead] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [entryStatus, setEntryStatus] = useState<'Draft' | 'Submitted'>('Submitted');

  // Collapsible Sections
  const [contactsOpen, setContactsOpen] = useState(true);
  const [billingOpen, setBillingOpen] = useState(true);
  const [referencesOpen, setReferencesOpen] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [custRes, invRes, payRes] = await Promise.all([
        acmasoService.getParties('Customer'),
        acmasoService.getSalesInvoices(),
        acmasoService.getSalesPayments(),
      ]);
      setCustomers(custRes || []);
      setInvoices(invRes || []);
      setPayments(payRes || []);
    } catch {
      showToast('Failed to load customers from database.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingCustomer(null);
    setName('');
    setRole('Customer');
    setAvatarUrl('');
    setEmail('');
    setPhone('');
    setAddress('');
    setDefaultAccount('Debtors');
    setCurrency('INR');
    setGstRegistration('Unregistered');
    setFromLead('');
    setGstin('');
    setPan('');
    setPlaceOfSupply('Maharashtra');
    setOpeningBalance(0);
    setStatus('Active');
    setEntryStatus('Submitted');
    setContactsOpen(true);
    setBillingOpen(true);
    setReferencesOpen(true);
    setShowModal(true);
  }

  function handleOpenEdit(cust: Party) {
    setEditingCustomer(cust);
    setName(cust.name);
    setRole(cust.role || 'Customer');
    setAvatarUrl('');
    setEmail(cust.email || '');
    setPhone(cust.phone || '');
    setAddress(cust.address || '');
    setDefaultAccount(cust.defaultAccount || 'Debtors');
    setCurrency('INR');
    setGstRegistration(cust.gstin ? 'Registered Regular' : 'Unregistered');
    setFromLead('');
    setGstin(cust.gstin || '');
    setPan(cust.pan || '');
    setPlaceOfSupply(cust.placeOfSupply || 'Maharashtra');
    setOpeningBalance(cust.openingBalance || 0);
    setStatus((cust.status as 'Active' | 'Inactive') || 'Active');
    setEntryStatus('Submitted');
    setContactsOpen(true);
    setBillingOpen(true);
    setReferencesOpen(true);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Customer name is required.', 'error');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        role: 'Customer' as const,
        gstin: gstin.trim().toUpperCase(),
        pan: pan.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        placeOfSupply,
        defaultAccount: defaultAccount || 'Debtors',
        openingBalance: Number(openingBalance) || 0,
        status,
      };

      if (editingCustomer) {
        await acmasoService.updateParty(editingCustomer.id, payload);
        showToast('Customer updated successfully.', 'success');
      } else {
        await acmasoService.createParty(payload);
        showToast('Customer created successfully.', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  }

  async function handleDelete(cust: Party) {
    const customerInvoices = invoices.filter((i) => i.party === cust.name && i.status !== 'Cancelled');
    const customerPayments = payments.filter((p) => p.party === cust.name);
    const hasOutstanding = (cust.outstandingAmount || 0) > 0;

    if (customerInvoices.length > 0 || customerPayments.length > 0 || hasOutstanding) {
      alert(`Cannot delete customer "${cust.name}" because there are ${customerInvoices.length} active invoice(s) and ${customerPayments.length} payment receipt(s) linked to this customer account.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete customer "${cust.name}"?`)) return;

    try {
      await acmasoService.deleteParty(cust.id);
      showToast('Customer deleted successfully.', 'info');
      setViewCustomer(null);
      loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  function handleExportCsv() {
    if (customers.length === 0) {
      showToast('No customers to export.', 'info');
      return;
    }
    const headers = ['#', 'Name', 'Email', 'Phone', 'Outstanding Amount'];
    const rows = filtered.map((c, idx) => [
      idx + 1,
      c.name,
      c.email || '',
      c.phone || '',
      c.calculatedOutstanding || 0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const customerListWithBalances = useMemo(() => {
    return customers.map((c) => {
      const activeInvs = invoices.filter((i) => i.party === c.name && i.status !== 'Cancelled');
      const totalOutstanding = activeInvs.reduce((sum, inv) => sum + (Number(inv.outstandingAmount) || 0), (c.openingBalance || 0));
      return {
        ...c,
        calculatedOutstanding: totalOutstanding,
      };
    });
  }, [customers, invoices]);

  const filtered = useMemo(() => {
    return customerListWithBalances.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.gstin || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search) ||
        (c.placeOfSupply || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || (c.status || 'Active') === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customerListWithBalances, search, statusFilter]);

  const effectivePageSize = pageSize === 'All' ? filtered.length || 1 : pageSize;
  const totalPages = Math.ceil(filtered.length / effectivePageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    if (pageSize === 'All') return filtered;
    const start = (currentPage - 1) * effectivePageSize;
    return filtered.slice(start, start + effectivePageSize);
  }, [filtered, currentPage, effectivePageSize, pageSize]);

  const selectedCustomerInvoices = useMemo(() => {
    if (!viewCustomer) return [];
    return invoices.filter((i) => i.party === viewCustomer.name);
  }, [viewCustomer, invoices]);

  const selectedCustomerPayments = useMemo(() => {
    if (!viewCustomer) return [];
    return payments.filter((p) => p.party === viewCustomer.name);
  }, [viewCustomer, payments]);

  const totalBilled = selectedCustomerInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalPaid = selectedCustomerPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

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

          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Customers</h1>

          {showSearchInput && (
            <div style={{ position: 'relative', width: 220, marginLeft: 8 }}>
              <Input
                type="text"
                placeholder="Type to filter customers..."
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
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 8px' }}>STATUS</div>
                {['All', 'Active', 'Inactive'].map((st) => (
                  <div
                    key={st}
                    onClick={() => {
                      setStatusFilter(st as any);
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
            title="Make Entry (New Customer)"
          >
            <i className="fas fa-plus" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {/* Main Table / Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader label="Loading customers..." />
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Phone</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Outstanding Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((c, idx) => {
                const globalIndex = pageSize === 'All' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setViewCustomer(c)}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{globalIndex}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{c.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.email || ''}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.phone || ''}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#1e293b' }}>
                      ₹ {Number(c.calculatedOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Customer Statement & Transaction History Modal */}
      {viewCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{viewCustomer.name}</h3>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Complete Customer Statement & Financial Activity</span>
              </div>
              <button onClick={() => setViewCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>×</button>
            </div>

            {/* Customer Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>GSTIN / Tax ID</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{viewCustomer.gstin || 'Unregistered'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Invoiced</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>₹{totalBilled.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Total Payments</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>₹{totalPaid.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Outstanding Balance</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>
                  ₹{Number((viewCustomer as any).calculatedOutstanding ?? viewCustomer.outstandingAmount ?? 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Customer Contact & Address Strip */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, marginBottom: 18, fontSize: 12.5, display: 'flex', gap: 20, color: '#475569', flexWrap: 'wrap' }}>
              <div><strong>Email:</strong> {viewCustomer.email || '—'}</div>
              <div><strong>Phone:</strong> {viewCustomer.phone || '—'}</div>
              <div><strong>Place of Supply:</strong> {viewCustomer.placeOfSupply || 'Maharashtra'}</div>
              {viewCustomer.address && <div><strong>Address:</strong> {viewCustomer.address}</div>}
            </div>

            {/* History Tabs */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', marginBottom: 16 }}>
              <button
                onClick={() => setHistoryTab('invoices')}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: historyTab === 'invoices' ? '2px solid #0d9488' : '2px solid transparent',
                  fontWeight: 700,
                  fontSize: 13,
                  color: historyTab === 'invoices' ? '#0d9488' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-file-invoice" style={{ marginRight: 6 }} /> Sales Invoices ({selectedCustomerInvoices.length})
              </button>
              <button
                onClick={() => setHistoryTab('payments')}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: historyTab === 'payments' ? '2px solid #0d9488' : '2px solid transparent',
                  fontWeight: 700,
                  fontSize: 13,
                  color: historyTab === 'payments' ? '#0d9488' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-money-bill-transfer" style={{ marginRight: 6 }} /> Payments Received ({selectedCustomerPayments.length})
              </button>
            </div>

            {/* Invoices List */}
            {historyTab === 'invoices' && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Invoice #</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Outstanding (₹)</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Payment</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomerInvoices.map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>{inv.date}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>₹{Number(inv.grandTotal).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: inv.outstandingAmount > 0 ? '#dc2626' : '#16a34a' }}>
                          ₹{Number(inv.outstandingAmount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: inv.paymentStatus === 'Paid' ? '#dcfce7' : inv.paymentStatus === 'Partially Paid' ? '#fef3c7' : '#fee2e2',
                              color: inv.paymentStatus === 'Paid' ? '#16a34a' : inv.paymentStatus === 'Partially Paid' ? '#d97706' : '#dc2626',
                            }}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: inv.status === 'Submitted' ? '#dbeafe' : inv.status === 'Cancelled' ? '#f1f5f9' : '#fef9c3',
                              color: inv.status === 'Submitted' ? '#1d4ed8' : inv.status === 'Cancelled' ? '#94a3b8' : '#854d0e',
                            }}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {selectedCustomerInvoices.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                          No sales invoices recorded for this customer yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payments List */}
            {historyTab === 'payments' && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Receipt #</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Payment Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Linked Invoice</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Mode</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount Paid (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomerPayments.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>{p.id.slice(-8).toUpperCase()}</td>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>{p.date}</td>
                        <td style={{ padding: '8px 12px', color: '#2563eb', fontWeight: 600 }}>{p.invoiceNumber || p.invoiceId || 'On Account'}</td>
                        <td style={{ padding: '8px 12px' }}>{p.modeOfPayment || p.paymentMethod}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                    {selectedCustomerPayments.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                          No payment receipts found for this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={() => handleDelete(viewCustomer)}
                >
                  <i className="fas fa-trash-alt" style={{ marginRight: 6 }} /> Delete Customer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const c = viewCustomer;
                    setViewCustomer(null);
                    handleOpenEdit(c);
                  }}
                >
                  <i className="fas fa-edit" style={{ marginRight: 6 }} /> Edit
                </Button>
              </div>
              <Button variant="outline" onClick={() => setViewCustomer(null)}>Close Statement</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Customer Modal (Exact Frappe Books New Entry UI) */}
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
                  {editingCustomer ? 'Edit Customer' : 'New Entry'}
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
                {entryStatus === 'Draft' ? 'Draft' : 'Draft'}
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 24px 20px' }}>
              {/* Top Section: Avatar Box (Left) + Name & Role (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20, marginBottom: 20, alignItems: 'start' }}>
                {/* Avatar / Camera Box */}
                <div>
                  <label
                    style={{
                      width: 120,
                      height: 120,
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                    }}
                    title="Upload customer photo or logo"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="fas fa-camera" style={{ fontSize: 32, color: '#cbd5e1' }} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = () => setAvatarUrl(reader.result as string);
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Name & Role Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        required
                        style={{
                          width: '100%',
                          height: 44,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          padding: '0 30px 0 14px',
                          fontSize: 14,
                          color: '#1e293b',
                          background: '#f8fafc',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          right: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#ef4444',
                          fontSize: 16,
                          fontWeight: 700,
                          pointerEvents: 'none',
                        }}
                      >
                        *
                      </span>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Role
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
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
                        <option value="Customer">Customer</option>
                        <option value="Client">Client</option>
                        <option value="Patient">Patient</option>
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
                          fontSize: 9,
                          lineHeight: '9px',
                        }}
                      >
                        <span>▲</span>
                        <span>▼</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Section 1: Contacts */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setContactsOpen(!contactsOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: contactsOpen ? 14 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Contacts</h3>
                  <i
                    className={`fas fa-chevron-${contactsOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {contactsOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Email & Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@doe.com"
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
                          Phone
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone"
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
                    </div>

                    {/* Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Address"
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
                            fontSize: 9,
                            lineHeight: '9px',
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

              {/* Collapsible Section 2: Billing */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setBillingOpen(!billingOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: billingOpen ? 14 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Billing</h3>
                  <i
                    className={`fas fa-chevron-${billingOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {billingOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Default Account & Currency */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Default Account
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={defaultAccount}
                            onChange={(e) => setDefaultAccount(e.target.value)}
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
                            <option value="Customer Clearing A/c">Customer Clearing A/c</option>
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
                              fontSize: 9,
                              lineHeight: '9px',
                            }}
                          >
                            <span>▲</span>
                            <span>▼</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Currency
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
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
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="AED">AED</option>
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
                              fontSize: 9,
                              lineHeight: '9px',
                            }}
                          >
                            <span>▲</span>
                            <span>▼</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* GST Registration */}
                    <div style={{ maxWidth: 'calc(50% - 9px)' }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        GST Registration
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={gstRegistration}
                          onChange={(e) => setGstRegistration(e.target.value)}
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
                          <option value="Unregistered">Unregistered</option>
                          <option value="Registered Regular">Registered Regular</option>
                          <option value="Registered Composition">Registered Composition</option>
                          <option value="Overseas">Overseas</option>
                          <option value="SEZ">SEZ</option>
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
                            fontSize: 9,
                            lineHeight: '9px',
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
                  <div style={{ maxWidth: 'calc(50% - 9px)' }}>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      From Lead
                    </label>
                    <input
                      type="text"
                      value={fromLead}
                      onChange={(e) => setFromLead(e.target.value)}
                      placeholder="From Lead"
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
                    setEntryStatus('Draft');
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
                  onClick={() => setEntryStatus('Submitted')}
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

export default Customers;
