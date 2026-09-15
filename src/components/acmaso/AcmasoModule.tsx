import React, { useState } from 'react';
import { DashboardTab } from './DashboardTab';
import { SalesInvoices } from './SalesInvoices';
import { SalesQuotes } from './SalesQuotes';
import { SalesPayments } from './SalesPayments';
import { Customers } from './Customers';
import { SalesItems } from './SalesItems';
import { PurchaseInvoices } from './PurchaseInvoices';
import { PurchasePayments } from './PurchasePayments';
import { Suppliers } from './Suppliers';
import { JournalEntries } from './JournalEntries';
import { Parties } from './Parties';
import { GeneralLedger } from './GeneralLedger';
import { TrialBalance } from './TrialBalance';
import { ProfitAndLoss } from './ProfitAndLoss';
import { BalanceSheet } from './BalanceSheet';
import { GSTR1Report } from './GSTR1Report';
import { GSTR2Report } from './GSTR2Report';
import { ChartOfAccounts } from './ChartOfAccounts';
import { TaxTemplates } from './TaxTemplates';
import { ImportWizard } from './ImportWizard';
import { PrintTemplates } from './PrintTemplates';
import { AccountingSettings } from './AccountingSettings';

type MainTab = 'dashboard' | 'sales' | 'purchases' | 'common' | 'reports' | 'gst' | 'setup';

export const AcmasoModule: React.FC = () => {
  const [mainTab, setMainTab] = useState<MainTab>('dashboard');
  const [salesSubTab, setSalesSubTab] = useState<'quotes' | 'invoices' | 'payments' | 'customers' | 'items'>('quotes');
  const [purchasesSubTab, setPurchasesSubTab] = useState<'invoices' | 'payments' | 'suppliers' | 'items'>('invoices');
  const [commonSubTab, setCommonSubTab] = useState<'journals' | 'parties' | 'items'>('journals');
  const [reportsSubTab, setReportsSubTab] = useState<'gl' | 'tb' | 'pl' | 'bs'>('gl');
  const [gstSubTab, setGstSubTab] = useState<'gstr1' | 'gstr2'>('gstr1');
  const [setupSubTab, setSetupSubTab] = useState<'coa' | 'taxes' | 'import' | 'print' | 'settings'>('coa');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner Header */}
      <div className="panel" style={{
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'linear-gradient(135deg, #0b1a33 0%, #1e3a8a 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(6, 40, 79, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            color: '#60a5fa'
          }}>
            <i className="fa-solid fa-book-bookmark"></i>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Acmaso Accounting
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#93c5fd', opacity: 0.95 }}>
              Native Frappe Books Double-Entry Financial & GST Engine for CUREMASO
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.18)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }}></span>
            Real-time Double Entry Active
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="tab-nav" style={{
        margin: 0,
        padding: '6px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
          { id: 'sales', label: 'Sales', icon: 'fa-file-invoice' },
          { id: 'purchases', label: 'Purchases', icon: 'fa-cart-shopping' },
          { id: 'common', label: 'Common', icon: 'fa-book-journal-whills' },
          { id: 'reports', label: 'Reports', icon: 'fa-chart-column' },
          { id: 'gst', label: 'GST', icon: 'fa-receipt' },
          { id: 'setup', label: 'Setup', icon: 'fa-sliders' },
        ].map((tab) => {
          const isActive = mainTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setMainTab(tab.id as any)}
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#1e3a8a' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                boxShadow: isActive ? '0 2px 8px rgba(30, 58, 138, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <i className={`fa-solid ${tab.icon}`} style={{ color: isActive ? '#60a5fa' : '#94a3b8' }}></i> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Sub-Tabs: Sales */}
      {mainTab === 'sales' && (
        <div className="tab-nav" style={{
          margin: 0,
          padding: '6px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {[
            { id: 'quotes', label: 'Sales Quotes', icon: 'fa-file-signature' },
            { id: 'invoices', label: 'Sales Invoices', icon: 'fa-file-invoice' },
            { id: 'payments', label: 'Sales Payments', icon: 'fa-money-bill-transfer' },
            { id: 'customers', label: 'Customers', icon: 'fa-users' },
            { id: 'items', label: 'Sales Items', icon: 'fa-box-open' },
          ].map((sub) => {
            const isActive = salesSubTab === sub.id;
            return (
              <button
                key={sub.id}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSalesSubTab(sub.id as any)}
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className={`fa-solid ${sub.icon}`} style={{ color: isActive ? '#ffffff' : '#94a3b8', fontSize: '13px' }}></i> {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Secondary Sub-Tabs: Purchases */}
      {mainTab === 'purchases' && (
        <div className="tab-nav" style={{
          margin: 0,
          padding: '6px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {[
            { id: 'invoices', label: 'Purchase Invoice', icon: 'fa-file-invoice-dollar' },
            { id: 'payments', label: 'Purchase Payments', icon: 'fa-money-bill-transfer' },
            { id: 'suppliers', label: 'Suppliers', icon: 'fa-truck-field' },
            { id: 'items', label: 'Purchase Items', icon: 'fa-boxes-packing' },
          ].map((sub) => {
            const isActive = purchasesSubTab === sub.id;
            return (
              <button
                key={sub.id}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setPurchasesSubTab(sub.id as any)}
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className={`fa-solid ${sub.icon}`} style={{ color: isActive ? '#ffffff' : '#94a3b8', fontSize: '13px' }}></i> {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Secondary Sub-Tabs: Common */}
      {mainTab === 'common' && (
        <div className="tab-nav" style={{
          margin: 0,
          padding: '6px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {[
            { id: 'journals', label: 'Journal Entry', icon: 'fa-pen-nib' },
            { id: 'parties', label: 'Party', icon: 'fa-address-book' },
            { id: 'items', label: 'Items', icon: 'fa-cubes' },
          ].map((sub) => {
            const isActive = commonSubTab === sub.id;
            return (
              <button
                key={sub.id}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setCommonSubTab(sub.id as any)}
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className={`fa-solid ${sub.icon}`} style={{ color: isActive ? '#ffffff' : '#94a3b8', fontSize: '13px' }}></i> {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Secondary Sub-Tabs: Reports */}
      {mainTab === 'reports' && (
        <div className="tab-nav" style={{
          margin: 0,
          padding: '6px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {[
            { id: 'gl', label: 'General Ledger', icon: 'fa-book' },
            { id: 'pl', label: 'Profit And Loss', icon: 'fa-chart-line' },
            { id: 'bs', label: 'Balance Sheet', icon: 'fa-landmark' },
            { id: 'tb', label: 'Trial Balance', icon: 'fa-scale-balanced' },
          ].map((sub) => {
            const isActive = reportsSubTab === sub.id;
            return (
              <button
                key={sub.id}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setReportsSubTab(sub.id as any)}
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className={`fa-solid ${sub.icon}`} style={{ color: isActive ? '#ffffff' : '#94a3b8', fontSize: '13px' }}></i> {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Secondary Sub-Tabs: GST */}
      {mainTab === 'gst' && (
        <div className="tab-nav" style={{
          margin: 0,
          padding: '6px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {[
            { id: 'gstr1', label: 'GSTR1', icon: 'fa-file-invoice-dollar' },
            { id: 'gstr2', label: 'GSTR2', icon: 'fa-receipt' },
          ].map((sub) => {
            const isActive = gstSubTab === sub.id;
            return (
              <button
                key={sub.id}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setGstSubTab(sub.id as any)}
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className={`fa-solid ${sub.icon}`} style={{ color: isActive ? '#ffffff' : '#94a3b8', fontSize: '13px' }}></i> {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Secondary Sub-Tabs: Setup */}
      {mainTab === 'setup' && (
        <div className="tab-nav" style={{
          margin: 0,
          padding: '6px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {[
            { id: 'coa', label: 'Chart of Accounts', icon: 'fa-sitemap' },
            { id: 'taxes', label: 'Tax Templates', icon: 'fa-percent' },
            { id: 'import', label: 'Import Wizard', icon: 'fa-file-import' },
            { id: 'print', label: 'Print Templates', icon: 'fa-print' },
            { id: 'settings', label: 'Settings', icon: 'fa-gears' },
          ].map((sub) => {
            const isActive = setupSubTab === sub.id;
            return (
              <button
                key={sub.id}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSetupSubTab(sub.id as any)}
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className={`fa-solid ${sub.icon}`} style={{ color: isActive ? '#ffffff' : '#94a3b8', fontSize: '13px' }}></i> {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Tab View */}
      <div>
        {mainTab === 'dashboard' && <DashboardTab />}

        {mainTab === 'sales' && salesSubTab === 'invoices' && <SalesInvoices />}
        {mainTab === 'sales' && salesSubTab === 'quotes' && <SalesQuotes />}
        {mainTab === 'sales' && salesSubTab === 'payments' && <SalesPayments />}
        {mainTab === 'sales' && salesSubTab === 'customers' && <Customers />}
        {mainTab === 'sales' && salesSubTab === 'items' && <SalesItems />}

        {mainTab === 'purchases' && purchasesSubTab === 'invoices' && <PurchaseInvoices />}
        {mainTab === 'purchases' && purchasesSubTab === 'payments' && <PurchasePayments />}
        {mainTab === 'purchases' && purchasesSubTab === 'suppliers' && <Suppliers />}
        {mainTab === 'purchases' && purchasesSubTab === 'items' && <SalesItems filterType="purchases" />}

        {mainTab === 'common' && commonSubTab === 'journals' && <JournalEntries />}
        {mainTab === 'common' && commonSubTab === 'parties' && <Parties />}
        {mainTab === 'common' && commonSubTab === 'items' && <SalesItems filterType="all" />}

        {mainTab === 'reports' && reportsSubTab === 'gl' && <GeneralLedger />}
        {mainTab === 'reports' && reportsSubTab === 'tb' && <TrialBalance />}
        {mainTab === 'reports' && reportsSubTab === 'pl' && <ProfitAndLoss />}
        {mainTab === 'reports' && reportsSubTab === 'bs' && <BalanceSheet />}

        {mainTab === 'gst' && gstSubTab === 'gstr1' && <GSTR1Report />}
        {mainTab === 'gst' && gstSubTab === 'gstr2' && <GSTR2Report />}

        {mainTab === 'setup' && setupSubTab === 'coa' && <ChartOfAccounts />}
        {mainTab === 'setup' && setupSubTab === 'taxes' && <TaxTemplates />}
        {mainTab === 'setup' && setupSubTab === 'import' && <ImportWizard />}
        {mainTab === 'setup' && setupSubTab === 'print' && <PrintTemplates />}
        {mainTab === 'setup' && setupSubTab === 'settings' && <AccountingSettings />}
      </div>
    </div>
  );
};
