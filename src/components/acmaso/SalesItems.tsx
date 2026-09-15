import React, { useEffect, useState, useMemo } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { Item, Account, TaxTemplate } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

interface SalesItemsProps {
  filterType?: 'sales' | 'purchases' | 'all';
}

export const SalesItems: React.FC<SalesItemsProps> = ({ filterType = 'sales' }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [taxTemplates, setTaxTemplates] = useState<TaxTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [taxFilter, setTaxFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'All'>(50);

  // Selection mode state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Modals & Details
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [purpose, setPurpose] = useState('Sales');
  const [type, setType] = useState('Product');
  const [unit, setUnit] = useState('Unit');
  const [rate, setRate] = useState<number>(0);
  const [purchaseRate, setPurchaseRate] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Medical Equipment');
  const [incomeAccount, setIncomeAccount] = useState('Income');
  const [expenseAccount, setExpenseAccount] = useState('Expense');
  const [taxTemplateName, setTaxTemplateName] = useState('Tax');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [hsnSac, setHsnSac] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [entryStatus, setEntryStatus] = useState<'Draft' | 'Submitted'>('Submitted');

  // Collapsible Sections
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(true);

  const pageTitle = filterType === 'purchases' ? 'Purchase Items' : filterType === 'all' ? 'Items' : 'Sales Items';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [itemsRes, accsRes, taxRes] = await Promise.all([
        acmasoService.getItems(),
        acmasoService.getAccounts(),
        acmasoService.getTaxTemplates(),
      ]);
      setItems(itemsRes || []);
      setAccounts(accsRes || []);
      setTaxTemplates(taxRes || []);
    } catch {
      showToast('Failed to load items catalog.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingItem(null);
    setName('');
    setCode('');
    setAvatarUrl('');
    setPurpose('Sales');
    setType('Product');
    setUnit('Unit');
    setRate(0);
    setPurchaseRate(0);
    setDescription('');
    setCategory('Medical Equipment');
    setIncomeAccount('Income');
    setExpenseAccount('Expense');
    setTaxTemplateName('Tax');
    setTaxRate(18);
    setHsnSac('');
    setStatus('Active');
    setEntryStatus('Submitted');
    setDetailsOpen(true);
    setAccountsOpen(true);
    setInventoryOpen(true);
    setShowModal(true);
  }

  function handleOpenEdit(it: Item) {
    setEditingItem(it);
    setName(it.name);
    setCode(it.code);
    setAvatarUrl('');
    setPurpose('Sales');
    setType('Product');
    setUnit(it.unit || 'Unit');
    setRate(it.rate || 0);
    setPurchaseRate(it.purchaseRate || it.purchase_rate || 0);
    setDescription(it.description || '');
    setCategory(it.category || 'Medical Equipment');
    setIncomeAccount(it.incomeAccount || it.income_account || 'Income');
    setExpenseAccount(it.expenseAccount || it.expense_account || 'Expense');
    setTaxTemplateName(it.taxRate !== undefined ? `GST-${it.taxRate}%` : 'Tax');
    setTaxRate(it.taxRate ?? it.tax_rate ?? 18);
    setHsnSac(it.hsnSac || it.hsn_code || '');
    setStatus(it.status || 'Active');
    setEntryStatus('Submitted');
    setDetailsOpen(true);
    setAccountsOpen(true);
    setInventoryOpen(true);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Item name is required.', 'error');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        code: code.trim() ? code.trim().toUpperCase() : `ITM-${Date.now().toString().slice(-6)}`,
        description: description.trim(),
        category,
        unit,
        rate: Number(rate) || 0,
        purchaseRate: Number(purchaseRate) || 0,
        hsnSac: hsnSac.trim(),
        incomeAccount: incomeAccount || 'Sales',
        expenseAccount: expenseAccount || 'Cost of Goods Sold',
        taxRate: Number(taxRate) || 0,
        status,
      };

      if (editingItem) {
        await acmasoService.updateItem(editingItem.id, payload);
        showToast('Item updated successfully.', 'success');
      } else {
        await acmasoService.createItem(payload);
        showToast('Item added to catalog.', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  }

  async function handleDelete(it: Item) {
    if (!window.confirm(`Are you sure you want to delete item "${it.name}" (${it.code})?`)) return;
    try {
      await acmasoService.deleteItem(it.id);
      showToast('Item deleted.', 'info');
      setViewItem(null);
      loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  function handleToggleSelectAll() {
    if (selectedItemIds.length === filtered.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filtered.map((it) => it.id));
    }
  }

  function handleToggleSelect(id: string) {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  }

  function handleExportCsv() {
    if (items.length === 0) {
      showToast('No items to export.', 'info');
      return;
    }
    const headers = ['#', 'Item Name', 'Unit Type', 'Tax', 'Rate'];
    const rows = filtered.map((it, idx) => [
      idx + 1,
      it.name,
      it.unit || 'Unit',
      `GST-${it.taxRate ?? it.tax_rate ?? 18}`,
      it.rate || 0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_items_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.code.toLowerCase().includes(search.toLowerCase()) ||
        (it.hsnSac || it.hsn_code || '').includes(search) ||
        (it.category || '').toLowerCase().includes(search.toLowerCase());

      const itemTax = it.taxRate ?? it.tax_rate ?? 18;
      const matchTax = taxFilter === 'All' || String(itemTax) === taxFilter;

      return matchSearch && matchTax;
    });
  }, [items, search, taxFilter]);

  const effectivePageSize = pageSize === 'All' ? filtered.length || 1 : pageSize;
  const totalPages = Math.ceil(filtered.length / effectivePageSize) || 1;
  const paginatedItems = useMemo(() => {
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

          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{pageTitle}</h1>

          {showSearchInput && (
            <div style={{ position: 'relative', width: 220, marginLeft: 8 }}>
              <Input
                type="text"
                placeholder="Type to filter items..."
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
            onClick={() => setIsSelectMode(!isSelectMode)}
            style={{
              background: isSelectMode ? '#e2e8f0' : '#f1f5f9',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: isSelectMode ? '#0f172a' : '#475569',
              cursor: 'pointer',
            }}
          >
            Select
          </button>

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
                background: taxFilter !== 'All' ? '#e2e8f0' : '#f1f5f9',
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
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 8px' }}>GST TAX RATE</div>
                {['All', '0', '5', '12', '18', '28'].map((tr) => (
                  <div
                    key={tr}
                    onClick={() => {
                      setTaxFilter(tr);
                      setShowFilterDropdown(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '6px 8px',
                      fontSize: 13,
                      cursor: 'pointer',
                      borderRadius: 4,
                      background: taxFilter === tr ? '#f1f5f9' : 'transparent',
                      fontWeight: taxFilter === tr ? 600 : 400,
                      color: '#1e293b',
                    }}
                  >
                    {tr === 'All' ? 'All Tax Rates' : `GST-${tr}%`}
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
            title="Make Entry (New Item)"
          >
            <i className="fas fa-plus" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {/* Main Table / Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Loader label="Loading items catalog..." />
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
                {isSelectMode && (
                  <th style={{ width: 30, padding: '12px 8px 12px 16px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedItemIds.length === filtered.length && filtered.length > 0}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                )}
                <th style={{ width: 40, padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Item Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Unit Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Tax</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#64748b', fontSize: 12 }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((it, idx) => {
                const globalIndex = pageSize === 'All' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                const taxName = `GST-${it.taxRate ?? it.tax_rate ?? 18}`;
                const isSelected = selectedItemIds.includes(it.id);

                return (
                  <tr
                    key={it.id}
                    onClick={() => {
                      if (isSelectMode) {
                        handleToggleSelect(it.id);
                      } else {
                        setViewItem(it);
                      }
                    }}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                      background: isSelected ? '#f8fafc' : 'transparent',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = isSelected ? '#f8fafc' : '')}
                  >
                    {isSelectMode && (
                      <td style={{ padding: '12px 8px 12px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(it.id)}
                        />
                      </td>
                    )}
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{globalIndex}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{it.name}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{it.unit || 'Unit'}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{taxName}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                      ₹ {Number(it.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Item Detail Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>{viewItem.category || 'ITEM MASTER'}</span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{viewItem.name}</h3>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>Code: {viewItem.code}</span>
              </div>
              <button onClick={() => setViewItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Selling Rate</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>₹{Number(viewItem.rate).toLocaleString('en-IN')} / {viewItem.unit || 'Unit'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Purchase / Cost Rate</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#64748b' }}>₹{Number(viewItem.purchaseRate || viewItem.purchase_rate || 0).toLocaleString('en-IN')} / {viewItem.unit || 'Unit'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>HSN / SAC Code</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{viewItem.hsnSac || viewItem.hsn_code || '—'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>GST Tax Bracket</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>GST-{viewItem.taxRate ?? viewItem.tax_rate ?? 18}%</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 14, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><strong>Default Income Account:</strong> {viewItem.incomeAccount || viewItem.income_account || 'Sales'}</div>
              <div><strong>Default Expense Account:</strong> {viewItem.expenseAccount || viewItem.expense_account || 'Cost of Goods Sold'}</div>
              <div><strong>Unit Type:</strong> {viewItem.unit || 'Unit'}</div>
            </div>

            {viewItem.description && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Description:</div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 10, borderRadius: 8, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                  {viewItem.description}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => handleDelete(viewItem)}
              >
                <i className="fas fa-trash-alt" style={{ marginRight: 6 }} /> Delete Item
              </Button>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
                <Button variant="primary" onClick={() => { setViewItem(null); handleOpenEdit(viewItem); }}>
                  <i className="fas fa-edit" style={{ marginRight: 6 }} /> Edit Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Item Modal (Exact Frappe Books New Entry UI) */}
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
                  {editingItem ? 'Edit Item' : 'New Entry'}
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
              {/* Top Section: Avatar Box (Left) + Item Name & Item Code (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20, marginBottom: 18, alignItems: 'start' }}>
                {/* Avatar / Photo Box */}
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
                    title="Upload item image"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

                {/* Item Name & Item Code */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Item Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Item Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Item Name"
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

                  {/* Item Code */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      Item Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Item Code"
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
              </div>

              {/* Purpose & Type Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                {/* Purpose */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Purpose
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
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
                      <option value="Sales">Sales</option>
                      <option value="Purchase">Purchase</option>
                      <option value="Both">Both</option>
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

                {/* Type */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                    Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
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
                      <option value="Product">Product</option>
                      <option value="Service">Service</option>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Unit Type & Rate */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Unit Type
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
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            style={{
                              border: 'none',
                              outline: 'none',
                              width: '100%',
                              fontSize: 14,
                              color: '#1e293b',
                              background: 'transparent',
                              cursor: 'pointer',
                            }}
                          >
                            {['Unit', 'Meter', 'Nos', 'Hours', 'Box', 'Sets', 'Kg', 'Pack', 'Bottle', 'Vial', 'Pcs'].map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                          <i className="fas fa-chevron-right" style={{ fontSize: 11, color: '#94a3b8' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Rate
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
                            value={rate || ''}
                            onChange={(e) => setRate(Number(e.target.value))}
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

                    {/* Description */}
                    <div style={{ maxWidth: 'calc(50% - 9px)' }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Item Description"
                        rows={3}
                        style={{
                          width: '100%',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          padding: '10px 14px',
                          fontSize: 13.5,
                          color: '#1e293b',
                          background: '#ffffff',
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Section 2: Accounts */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 18 }}>
                <div
                  onClick={() => setAccountsOpen(!accountsOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: accountsOpen ? 14 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Accounts</h3>
                  <i
                    className={`fas fa-chevron-${accountsOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {accountsOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Sales Acc. & Purchase Acc. */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          Sales Acc.
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={incomeAccount}
                            onChange={(e) => setIncomeAccount(e.target.value)}
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
                            <option value="Income">Income</option>
                            <option value="Sales">Sales</option>
                            <option value="Operating Revenue">Operating Revenue</option>
                            <option value="Other Income">Other Income</option>
                            {accounts.filter((a) => a.rootType === 'Income' && !a.isGroup).map((a) => (
                              <option key={a.id} value={a.name}>{a.name}</option>
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
                          Purchase Acc.
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={expenseAccount}
                            onChange={(e) => setExpenseAccount(e.target.value)}
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
                            <option value="Expense">Expense</option>
                            <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                            <option value="Operating Expense">Operating Expense</option>
                            {accounts.filter((a) => a.rootType === 'Expense' && !a.isGroup).map((a) => (
                              <option key={a.id} value={a.name}>{a.name}</option>
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

                    {/* Tax */}
                    <div style={{ maxWidth: 'calc(50% - 9px)' }}>
                      <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                        Tax
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={taxTemplateName}
                          onChange={(e) => {
                            setTaxTemplateName(e.target.value);
                            const parsed = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                            if (!isNaN(parsed)) setTaxRate(parsed);
                          }}
                          style={{
                            width: '100%',
                            height: 44,
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            padding: '0 36px 0 14px',
                            fontSize: 14,
                            color: taxTemplateName === 'Tax' ? '#64748b' : '#1e293b',
                            background: '#ffffff',
                            appearance: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Tax">Tax</option>
                          <option value="GST-0%">GST 0%</option>
                          <option value="GST-5%">GST 5%</option>
                          <option value="GST-12%">GST 12%</option>
                          <option value="GST-18%">GST 18%</option>
                          <option value="GST-28%">GST 28%</option>
                          {taxTemplates.map((t) => (
                            <option key={t.name} value={t.name}>{t.name} ({t.rate}%)</option>
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

              {/* Collapsible Section 3: Inventory */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18, marginBottom: 24 }}>
                <div
                  onClick={() => setInventoryOpen(!inventoryOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: inventoryOpen ? 14 : 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Inventory</h3>
                  <i
                    className={`fas fa-chevron-${inventoryOpen ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: '#94a3b8' }}
                  />
                </div>

                {inventoryOpen && (
                  <div style={{ maxWidth: 'calc(50% - 9px)' }}>
                    <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                      HSN/SAC
                    </label>
                    <input
                      type="text"
                      value={hsnSac}
                      onChange={(e) => setHsnSac(e.target.value)}
                      placeholder="HSN/SAC Code"
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

export default SalesItems;
