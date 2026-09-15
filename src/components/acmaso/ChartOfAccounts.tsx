import React, { useState, useEffect, useCallback } from 'react';
import { acmasoApi } from '../../services/acmaso.service';
import type { AccountingAccount } from '../../types/acmaso';
import { useToast } from '../../hooks/useToast';

export const ChartOfAccounts: React.FC = () => {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [parentAccount, setParentAccount] = useState('');
  const [rootType, setRootType] = useState<'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'>('Asset');
  const [accountType, setAccountType] = useState('Current Asset');
  const [isGroup, setIsGroup] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await acmasoApi.getAccounts();
      if (res.success && res.data) {
        setAccounts(res.data);
        // Expand top level groups by default
        const initialExpanded: Record<string, boolean> = {};
        res.data.forEach((acc: AccountingAccount) => {
          if (acc.is_group && (!acc.parent_account || acc.parent_account === '')) {
            initialExpanded[acc.name] = true;
          }
        });
        setExpandedNodes((prev) => ({ ...initialExpanded, ...prev }));
      }
    } catch {
      showToast('Failed to load Chart of Accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const toggleExpand = (accountName: string) => {
    setExpandedNodes((prev) => ({ ...prev, [accountName]: !prev[accountName] }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter account name', 'error');
      return;
    }

    try {
      const res = await acmasoApi.createAccount({
        name: name.trim(),
        parent_account: parentAccount || null,
        root_type: rootType,
        account_type: isGroup ? 'Group' : accountType,
        is_group: isGroup,
        balance: 0,
        currency: 'INR'
      });
      if (res.success) {
        showToast('Account created successfully', 'success');
        setShowModal(false);
        setName('');
        setParentAccount('');
        setIsGroup(false);
        loadAccounts();
      } else {
        showToast((res as any).error || 'Failed to create account', 'error');
      }
    } catch {
      showToast('Failed to create account', 'error');
    }
  };

  // Build Hierarchical Tree
  const buildTree = () => {
    const map: Record<string, { account: AccountingAccount; children: any[] }> = {};
    const roots: any[] = [];

    accounts.forEach((acc) => {
      map[acc.name] = { account: acc, children: [] };
    });

    accounts.forEach((acc) => {
      if (acc.parent_account && map[acc.parent_account]) {
        map[acc.parent_account].children.push(map[acc.name]);
      } else {
        roots.push(map[acc.name]);
      }
    });

    return roots;
  };

  const renderTreeNode = (node: any, level = 0) => {
    if (!node || !node.account) return null;
    const acc = node.account;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[acc.name];

    if (search && !acc.name.toLowerCase().includes(search.toLowerCase()) && !hasChildren) {
      return null;
    }

    const rootColor =
      acc.root_type === 'Asset' ? '#0d9488' :
      acc.root_type === 'Liability' ? '#ea580c' :
      acc.root_type === 'Equity' ? '#8b5cf6' :
      acc.root_type === 'Income' ? '#16a34a' : '#dc2626';

    return (
      <div key={acc.name} style={{ marginLeft: `${level * 20}px` }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid #f1f5f9',
          background: acc.is_group ? '#f8fafc' : 'white',
          borderRadius: '6px',
          margin: '2px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasChildren || acc.is_group ? (
              <button
                type="button"
                onClick={() => toggleExpand(acc.name)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '20px',
                  color: '#64748b',
                  fontSize: '12px'
                }}
              >
                <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
              </button>
            ) : (
              <div style={{ width: '20px', textAlign: 'center', color: '#cbd5e1' }}>•</div>
            )}

            <i className={`fa-solid ${acc.is_group ? 'fa-folder-open' : 'fa-file-invoice'}`} style={{ color: acc.is_group ? '#f59e0b' : '#64748b' }}></i>
            <span style={{ fontWeight: acc.is_group ? 600 : 400, color: '#0f172a' }}>{acc.name}</span>
            <span style={{
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: '4px',
              background: `${rootColor}15`,
              color: rootColor,
              fontWeight: 500
            }}>
              {acc.root_type} {acc.account_type && acc.account_type !== 'Group' ? `• ${acc.account_type}` : ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: acc.balance < 0 ? '#dc2626' : '#0f172a', minWidth: '100px', textAlign: 'right' }}>
              ₹{(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child: any) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredAccounts = accounts.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || (a.account_type && a.account_type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Action Bar */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-sitemap" style={{ color: '#0d9488' }}></i>
            Chart of Accounts
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Organize and manage your ledger hierarchy, asset classes, liabilities, equity, and P&L ledgers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }}></i>
            <input
              type="text"
              className="input"
              placeholder="Filter accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '30px', fontSize: '13px', padding: '6px 12px 6px 30px', width: '100%' }}
            />
          </div>
          <div className="tab-nav" style={{ margin: 0 }}>
            <button className={`tab-btn ${viewMode === 'tree' ? 'active' : ''}`} onClick={() => setViewMode('tree')} style={{ padding: '6px 12px', fontSize: '12px' }}>
              <i className="fa-solid fa-folder-tree"></i> Tree
            </button>
            <button className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} style={{ padding: '6px 12px', fontSize: '12px' }}>
              <i className="fa-solid fa-list"></i> List
            </button>
          </div>
          <button className="tab-btn" onClick={loadAccounts} style={{ padding: '6px 12px', fontSize: '12px' }}>
            <i className="fa-solid fa-arrows-rotate"></i>
          </button>
          <button className="tab-btn active" onClick={() => setShowModal(true)} style={{ padding: '6px 14px', fontSize: '12px' }}>
            <i className="fa-solid fa-plus"></i> Add Account
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="panel" style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading Chart of Accounts...
          </div>
        ) : viewMode === 'tree' ? (
          <div>{buildTree().map((node) => renderTreeNode(node, 0))}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Account Name</th>
                  <th style={{ padding: '12px 16px' }}>Parent Account</th>
                  <th style={{ padding: '12px 16px' }}>Root Category</th>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Is Group</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr key={acc.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: acc.is_group ? 600 : 400, color: '#0f172a' }}>{acc.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{acc.parent_account || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{acc.root_type}</td>
                    <td style={{ padding: '12px 16px' }}>{acc.account_type}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{acc.is_group ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                      ₹{(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Add New Account</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Account Name *
                </label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. ICICI Corporate Bank Account"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Parent Account (Group)
                </label>
                <select
                  className="input"
                  value={parentAccount}
                  onChange={(e) => {
                    setParentAccount(e.target.value);
                    const selected = accounts.find((a) => a.name === e.target.value);
                    if (selected && selected.root_type) {
                      setRootType(selected.root_type as any);
                    }
                  }}
                  style={{ width: '100%', padding: '8px 12px' }}
                >
                  <option value="">-- No Parent (Root) --</option>
                  {accounts
                    .filter((a) => a.is_group)
                    .map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name} ({a.root_type})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Root Category
                  </label>
                  <select
                    className="input"
                    value={rootType}
                    onChange={(e) => setRootType(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px' }}
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Account Type
                  </label>
                  <select
                    className="input"
                    disabled={isGroup}
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px' }}
                  >
                    <option value="Current Asset">Current Asset</option>
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                    <option value="Receivable">Receivable</option>
                    <option value="Fixed Asset">Fixed Asset</option>
                    <option value="Current Liability">Current Liability</option>
                    <option value="Payable">Payable</option>
                    <option value="Direct Income">Direct Income</option>
                    <option value="Direct Expense">Direct Expense</option>
                    <option value="Indirect Expense">Indirect Expense</option>
                    <option value="Tax">Tax</option>
                    <option value="Equity">Equity</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="isGroupCheck"
                  checked={isGroup}
                  onChange={(e) => setIsGroup(e.target.checked)}
                />
                <label htmlFor="isGroupCheck" style={{ fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}>
                  Is Group (Folder that can contain sub-accounts)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="tab-btn" onClick={() => setShowModal(false)} style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="tab-btn active" style={{ padding: '8px 20px' }}>
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
