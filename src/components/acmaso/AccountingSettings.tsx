import React, { useState, useEffect, useCallback } from 'react';
import { acmasoApi } from '../../services/acmaso.service';
import type { AccountingCompanySettings, AccountingAccount } from '../../types/acmaso';
import { useToast } from '../../hooks/useToast';

export const AccountingSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AccountingCompanySettings | null>(null);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, accRes] = await Promise.all([
        acmasoApi.getSettings(),
        acmasoApi.getAccounts()
      ]);
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      if (accRes.success && accRes.data) {
        setAccounts(accRes.data.filter((a) => !a.is_group));
      }
    } catch {
      showToast('Failed to load accounting settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await acmasoApi.updateSettings(settings);
      if (res.success) {
        showToast('Accounting settings saved', 'success');
      } else {
        showToast((res as any).error || 'Failed to save settings', 'error');
      }
    } catch {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all accounting data to default demo seed? All custom entries will be restored to initial state.')) {
      return;
    }
    setResetting(true);
    try {
      const res = await acmasoApi.resetData();
      if (res.success) {
        showToast('Accounting database re-initialized successfully', 'success');
        loadData();
      } else {
        showToast((res as any).error || 'Failed to reset database', 'error');
      }
    } catch {
      showToast('Failed to reset database', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="panel" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading settings...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-gears" style={{ color: '#0d9488' }}></i>
            General Accounting & Company Settings
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Configure default ledgers, company identification, fiscal year periods, and system database operations.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Company Info Panel */}
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-building" style={{ color: '#0d9488' }}></i>
            Company Identity & Fiscal Year
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Company Name *
              </label>
              <input
                type="text"
                className="input"
                required
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Base Currency
              </label>
              <input
                type="text"
                className="input"
                disabled
                value={settings.currency || 'INR'}
                style={{ width: '100%', padding: '8px 12px', background: '#f8fafc' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Current Fiscal Year
              </label>
              <input
                type="text"
                className="input"
                value={settings.fiscal_year || '2026-2027'}
                onChange={(e) => setSettings({ ...settings, fiscal_year: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Company GSTIN
              </label>
              <input
                type="text"
                className="input"
                value={settings.gstin || ''}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              />
            </div>
          </div>
        </div>

        {/* Default Accounts Panel */}
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-link" style={{ color: '#0d9488' }}></i>
            Default Posting Ledgers
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Default Bank Account
              </label>
              <select
                className="input"
                value={settings.default_bank_account}
                onChange={(e) => setSettings({ ...settings, default_bank_account: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                {accounts.filter((a) => a.account_type === 'Bank').map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Default Cash Account
              </label>
              <select
                className="input"
                value={settings.default_cash_account}
                onChange={(e) => setSettings({ ...settings, default_cash_account: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                {accounts.filter((a) => a.account_type === 'Cash').map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Default Accounts Receivable (Debtors)
              </label>
              <select
                className="input"
                value={settings.default_receivable_account}
                onChange={(e) => setSettings({ ...settings, default_receivable_account: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                {accounts.filter((a) => a.account_type === 'Receivable' || a.root_type === 'Asset').map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Default Accounts Payable (Creditors)
              </label>
              <select
                className="input"
                value={settings.default_payable_account}
                onChange={(e) => setSettings({ ...settings, default_payable_account: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                {accounts.filter((a) => a.account_type === 'Payable' || a.root_type === 'Liability').map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Default Income / Sales Account
              </label>
              <select
                className="input"
                value={settings.default_income_account}
                onChange={(e) => setSettings({ ...settings, default_income_account: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                {accounts.filter((a) => a.root_type === 'Income').map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Default Expense Account
              </label>
              <select
                className="input"
                value={settings.default_expense_account}
                onChange={(e) => setSettings({ ...settings, default_expense_account: e.target.value })}
                style={{ width: '100%', padding: '8px 12px' }}
              >
                {accounts.filter((a) => a.root_type === 'Expense').map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="tab-btn active" style={{ padding: '10px 24px', fontSize: '14px' }}>
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Settings
          </button>
        </div>
      </form>

      {/* Database Maintenance & Reset */}
      <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #ef4444', marginTop: '12px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          Database Maintenance & Sample Data Reset
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
          Reset your accounting database to Frappe Books seed records (accounts, customers, invoices, journals) or re-balance ledger postings.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            disabled={resetting}
            onClick={handleResetData}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #ef4444',
              background: '#fef2f2',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {resetting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate-left"></i>}
            Reset to Fresh Seed Data
          </button>
        </div>
      </div>
    </div>
  );
};
