import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { InvoicePrintModal } from './InvoicePrintModal';
import type { AccountingSalesInvoice } from '../../types/acmaso';

export const PrintTemplates: React.FC = () => {
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('Standard GST Tax Invoice');
  const [companyHeader, setCompanyHeader] = useState('CUREMASO HEALTHCARE & LABS PRIVATE LIMITED');
  const [subHeader, setSubHeader] = useState('Plot 42, Knowledge Park III, Greater Noida, UP - 201306');
  const [gstin, setGstin] = useState('09AAACC4132P1Z8');
  const [bankDetails, setBankDetails] = useState('HDFC Bank | A/C: 50200084920192 | IFSC: HDFC0001234');
  const [terms, setTerms] = useState('1. Payment due within 15 days of invoice date.\n2. Interest @18% p.a. charged on overdue balances.\n3. Subject to Noida Jurisdiction only.');
  const [showSampleModal, setShowSampleModal] = useState(false);

  const sampleInvoice: AccountingSalesInvoice = {
    id: 'INV-SAMPLE-001',
    name: 'INV-SAMPLE-001',
    invoiceNumber: 'INV-SAMPLE-001',
    party: 'Apex Health Systems Pvt Ltd',
    customer: 'Apex Health Systems Pvt Ltd',
    customer_name: 'Apex Health Systems Pvt Ltd',
    date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    items: [
      { item: 'ITM-001', name: 'Consultation & Diagnostics Package', item_name: 'Consultation & Diagnostics Package', quantity: 2, rate: 4500, amount: 9000, gst_rate: 18, cgst: 810, sgst: 810, igst: 0, total: 10620 },
      { item: 'ITM-002', name: 'Laboratory Automated Screening', item_name: 'Laboratory Automated Screening', quantity: 1, rate: 3500, amount: 3500, gst_rate: 18, cgst: 315, sgst: 315, igst: 0, total: 4130 }
    ],
    net_total: 12500,
    netTotal: 12500,
    total_taxes_and_charges: 2250,
    tax_total: 2250,
    taxTotal: 2250,
    grand_total: 14750,
    grandTotal: 14750,
    outstanding_amount: 14750,
    outstandingAmount: 14750,
    status: 'Unpaid',
    paymentStatus: 'Unpaid',
    place_of_supply: 'Uttar Pradesh',
    gstin: '09AABCA1122C1Z4',
    currency: 'INR'
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('acmaso_print_template', JSON.stringify({
      selectedTemplate,
      companyHeader,
      subHeader,
      gstin,
      bankDetails,
      terms
    }));
    showToast('Print template settings saved successfully!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-print" style={{ color: '#0d9488' }}></i>
            Print & Invoice Format Templates
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Customize invoice layout, GST compliance disclosures, bank settlement details, and terms.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="tab-btn" onClick={() => setShowSampleModal(true)} style={{ padding: '6px 14px', fontSize: '12px' }}>
            <i className="fa-solid fa-eye"></i> Preview Sample Invoice
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Active Invoice Layout Template
            </label>
            <select
              className="input"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={{ width: '100%', padding: '8px 12px' }}
            >
              <option value="Standard GST Tax Invoice">Standard GST Tax Invoice (Recommended)</option>
              <option value="Minimalist Clean Invoice">Minimalist Clean Corporate</option>
              <option value="Export Invoice">Export Invoice (with LUT / Foreign Currency)</option>
              <option value="Thermal POS Receipt">Thermal POS Slip (80mm)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Company Legal Header Name
            </label>
            <input
              type="text"
              className="input"
              value={companyHeader}
              onChange={(e) => setCompanyHeader(e.target.value)}
              style={{ width: '100%', padding: '8px 12px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Company Sub-header & Address
            </label>
            <input
              type="text"
              className="input"
              value={subHeader}
              onChange={(e) => setSubHeader(e.target.value)}
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
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              style={{ width: '100%', padding: '8px 12px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
            Bank Account Details for NEFT/RTGS Payments
          </label>
          <input
            type="text"
            className="input"
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
            style={{ width: '100%', padding: '8px 12px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
            Terms and Conditions / Notes Footer
          </label>
          <textarea
            className="input"
            rows={4}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="submit" className="tab-btn active" style={{ padding: '10px 24px', fontSize: '14px' }}>
            <i className="fa-solid fa-floppy-disk"></i> Save Print Configuration
          </button>
        </div>
      </form>

      {/* Live Sample Modal */}
      {showSampleModal && (
        <InvoicePrintModal
          document={sampleInvoice}
          docType="SalesInvoice"
          onClose={() => setShowSampleModal(false)}
        />
      )}
    </div>
  );
};
