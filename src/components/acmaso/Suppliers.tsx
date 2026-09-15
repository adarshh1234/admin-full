import React, { useEffect, useState, useMemo } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { Party, PurchaseInvoice } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const Suppliers: React.FC = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'All'>(50);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Party | null>(null);
  const [viewSupplier, setViewSupplier] = useState<Party | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [suppRes, invRes] = await Promise.all([
        acmasoService.getParties('Supplier'),
        acmasoService.getPurchaseInvoices(),
      ]);
      setSuppliers(suppRes);
      setInvoices(invRes);
    } catch (err: any) {
      showToast('Failed to load suppliers.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingSupplier(null);
    setName('');
    setGstin('');
    setPan('');
    setEmail('');
    setPhone('');
    setAddress('');
    setPlaceOfSupply('Maharashtra');
    setShowModal(true);
  }

  function handleOpenEdit(supp: Party) {
    setEditingSupplier(supp);
    setName(supp.name);
    setGstin(supp.gstin || '');
    setPan(supp.pan || '');
    setEmail(supp.email || '');
    setPhone(supp.phone || '');
    setAddress(supp.address || '');
    setPlaceOfSupply(supp.placeOfSupply || 'Maharashtra');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      showToast('Supplier name is required.', 'error');
      return;
    }

    try {
      const payload = {
        name,
        role: 'Supplier' as const,
        gstin,
        pan,
        email,
        phone,
        address,
        placeOfSupply,
        defaultAccount: 'Creditors',
      };

      if (editingSupplier) {
        await acmasoService.updateParty(editingSupplier.id, payload);
        showToast('Supplier updated successfully.', 'success');
      } else {
        await acmasoService.createParty(payload);
        showToast('Supplier created successfully.', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  }

  async function handleDelete(supp: Party) {
    if (!window.confirm(`Delete supplier ${supp.name}?`)) return;
    try {
      await acmasoService.deleteParty(supp.id);
      showToast('Supplier removed.', 'info');
      loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  function handleExportCsv() {
    if (suppliers.length === 0) {
      showToast('No suppliers to export.', 'info');
      return;
    }
    const headers = ['#', 'Name', 'Email', 'Phone', 'Outstanding Amount'];
    const rows = filtered.map((s, idx) => [
      idx + 1,
      s.name,
      s.email || '',
      s.phone || '',
      s.outstandingAmount || 0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suppliers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.gstin || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || '').includes(search);

      const matchStatus = statusFilter === 'All' || (s.status || 'Active') === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [suppliers, search, statusFilter]);

  const effectivePageSize = pageSize === 'All' ? filtered.length || 1 : pageSize;
  const totalPages = Math.ceil(filtered.length / effectivePageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
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

          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Suppliers</h1>

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
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 8px' }}>STATUS</div>
                {(['All', 'Active', 'Inactive'] as const).map((st) => (
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
            title="Make Entry (New Supplier)"
          >
            <i className="fas fa-plus" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader label="Loading suppliers..." />
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
              {paginatedSuppliers.map((s, idx) => {
                const globalIndex = pageSize === 'All' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={s.id}
                    onClick={() => setViewSupplier(s)}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{globalIndex}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{s.name}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{s.email || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.phone || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: (s.outstandingAmount || 0) > 0 ? '#dc2626' : '#1e293b' }}>
                      ₹ {Number(s.outstandingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Supplier / Vendor Name *</label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Siemens Healthineers India" style={{ width: '100%', height: 38 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>GSTIN (15 Digits)</label>
                  <Input type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="27AAACS1122D1Z4" style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PAN Number</label>
                  <Input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="AAACS1122D" style={{ width: '100%', height: 38 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Email Address</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="orders@supplier.com" style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Phone Number</label>
                  <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 22 3967 7000" style={{ width: '100%', height: 38 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Place of Supply (State)</label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                >
                  {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Rajasthan'].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Registered Office Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Premises, Street, City, Pincode"
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Supplier</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Bills History Drawer */}
      {viewSupplier && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{viewSupplier.name}</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Purchase Invoices and Payables Statement</span>
              </div>
              <button onClick={() => setViewSupplier(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>GSTIN</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{viewSupplier.gstin || 'Unregistered'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Place of Supply</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{viewSupplier.placeOfSupply || 'Maharashtra'}</div>
              </div>
              <div style={{ background: '#fffbeb', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>Outstanding Payable</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#d97706' }}>₹{Number(viewSupplier.outstandingAmount || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>Invoices from Supplier</h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Bill #</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Outstanding (₹)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.filter((i) => i.party === viewSupplier.name).map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#d97706' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>{inv.date}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{Number(inv.grandTotal).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: inv.outstandingAmount > 0 ? '#d97706' : '#16a34a' }}>
                        ₹{Number(inv.outstandingAmount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: inv.paymentStatus === 'Paid' ? '#16a34a' : '#d97706' }}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {invoices.filter((i) => i.party === viewSupplier.name).length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                        No bills recorded for this supplier yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: 12 }}
                  onClick={() => {
                    const toDelete = viewSupplier;
                    setViewSupplier(null);
                    handleDelete(toDelete);
                  }}
                >
                  <i className="fas fa-trash-alt" style={{ marginRight: 6 }} /> Delete Supplier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    const toEdit = viewSupplier;
                    setViewSupplier(null);
                    handleOpenEdit(toEdit);
                  }}
                >
                  <i className="fas fa-edit" style={{ marginRight: 6 }} /> Edit Supplier
                </Button>
              </div>
              <Button variant="outline" onClick={() => setViewSupplier(null)}>Close Statement</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
