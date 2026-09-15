import React, { useState, useEffect, useCallback } from 'react';
import { acmasoApi } from '../../services/acmaso.service';
import type { AccountingTaxTemplate, AccountingAccount } from '../../types/acmaso';
import { useToast } from '../../hooks/useToast';

export const TaxTemplates: React.FC = () => {
  const { showToast } = useToast();
  const [taxes, setTaxes] = useState<AccountingTaxTemplate[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [rate, setRate] = useState<number>(18);
  const [account, setAccount] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [taxRes, accRes] = await Promise.all([
        acmasoApi.getTaxes(),
        acmasoApi.getAccounts()
      ]);
      if (taxRes.success && taxRes.data) {
        setTaxes(taxRes.data);
      }
      if (accRes.success && accRes.data) {
        setAccounts(accRes.data.filter((a) => !a.is_group));
      }
    } catch {
      showToast('Failed to load tax templates', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    try {
      const res = await acmasoApi.createTax({
        name: name.trim(),
        title: title.trim(),
        rate: Number(rate),
        account: account || 'Output CGST - CURE',
        is_inter_state: false
      });
      if (res.success) {
        showToast('Tax template created', 'success');
        setShowModal(false);
        setName('');
        setTitle('');
        setRate(18);
        loadData();
      } else {
        showToast((res as any).error || 'Failed to create tax template', 'error');
      }
    } catch {
      showToast('Failed to create tax template', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Action Header */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-percent" style={{ color: '#0d9488' }}></i>
            GST & Tax Templates
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Define GST tax rates, ledger mappings (CGST, SGST, IGST), and auto-calculation rules.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="tab-btn" onClick={loadData} style={{ padding: '6px 12px', fontSize: '12px' }}>
            <i className="fa-solid fa-arrows-rotate"></i>
          </button>
          <button className="tab-btn active" onClick={() => setShowModal(true)} style={{ padding: '6px 14px', fontSize: '12px' }}>
            <i className="fa-solid fa-plus"></i> Add Tax Template
          </button>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Template Code</th>
                <th style={{ padding: '12px 16px' }}>Description / Title</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total GST Rate</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>CGST %</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>SGST %</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>IGST %</th>
                <th style={{ padding: '12px 16px' }}>Default Ledger Account</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading Tax Templates...
                  </td>
                </tr>
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No tax templates configured.
                  </td>
                </tr>
              ) : (
                taxes.map((t) => (
                  <tr key={t.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{t.name}</td>
                    <td style={{ padding: '12px 16px' }}>{t.title}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: '#e0f2fe',
                        color: '#0369a1'
                      }}>
                        {t.rate}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{(t.rate / 2).toFixed(1)}%</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{(t.rate / 2).toFixed(1)}%</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{t.rate}%</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{t.account || 'Output Tax Ledgers'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tax Modal */}
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
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create Tax Template</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Template Code *
                </label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. GST 18%"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Description / Title *
                </label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Goods and Services Tax 18% (CGST 9% + SGST 9% / IGST 18%)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Total Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="input"
                    required
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Tax Account
                  </label>
                  <select
                    className="input"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px' }}
                  >
                    <option value="">-- Select Ledger --</option>
                    {accounts.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="tab-btn" onClick={() => setShowModal(false)} style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="tab-btn active" style={{ padding: '8px 20px' }}>
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
