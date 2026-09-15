import React, { useRef } from 'react';
import { Button } from '../common/Button';
import type { SalesInvoice, SalesQuote, PurchaseInvoice } from '../../types/acmaso';

interface InvoicePrintModalProps {
  document: SalesInvoice | SalesQuote | PurchaseInvoice | null;
  docType: 'SalesInvoice' | 'SalesQuote' | 'PurchaseInvoice';
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ document, docType, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const title = docType === 'SalesQuote' ? 'QUOTATION' : docType === 'PurchaseInvoice' ? 'PURCHASE BILL' : 'TAX INVOICE';
  const number = (document as any).invoiceNumber || (document as any).quoteNumber || document.id;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: 820,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-print" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Print Preview — {number}
              </h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>Standard GST Print Template</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" onClick={handlePrint}>
              <i className="fas fa-print" style={{ marginRight: 6 }} /> Print Document
            </Button>
            <Button variant="outline" onClick={onClose}>
              <i className="fas fa-times" /> Close
            </Button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          ref={printRef}
          style={{
            padding: '36px 44px',
            overflowY: 'auto',
            background: '#ffffff',
            fontSize: 13,
            color: '#1e293b',
          }}
          className="printable-invoice"
        >
          {/* Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: 20, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', letterSpacing: -0.5 }}>
                CUREMASO HEALTHCARE SOLUTIONS
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                Suite 402, MedTech Tower, BKC, Mumbai, Maharashtra 400051<br />
                <strong>GSTIN:</strong> 27AABCC1234F1Z5 | <strong>PAN:</strong> AABCC1234F<br />
                <strong>Email:</strong> accounts@curemaso.com | <strong>Phone:</strong> +91 22 6890 4000
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{title}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>{number}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Date: <strong>{document.date}</strong></div>
              {(document as any).dueDate && (
                <div style={{ fontSize: 12, color: '#dc2626' }}>Due Date: <strong>{(document as any).dueDate}</strong></div>
              )}
            </div>
          </div>

          {/* Bill To / Supplier Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28, background: '#f8fafc', padding: 16, borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                {docType === 'PurchaseInvoice' ? 'Billed By (Supplier):' : 'Billed To (Customer):'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{document.party}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                Place of Supply: <strong>{(document as any).placeOfSupply || 'Maharashtra'}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                Status:
              </div>
              <span
                style={{
                  display: 'inline-block',
                  background: (document as any).status === 'Submitted' || (document as any).status === 'Accepted' ? '#dcfce7' : '#f1f5f9',
                  color: (document as any).status === 'Submitted' || (document as any).status === 'Accepted' ? '#16a34a' : '#475569',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {(document as any).status || 'Draft'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#2563eb', color: '#ffffff', fontSize: 12 }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>#</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Item &amp; Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Tax (%)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(document.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name || item.item}</div>
                    {item.description && <div style={{ fontSize: 11, color: '#64748b' }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{item.quantity} {item.unit || ''}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>{item.taxRate || 18}%</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {Number(item.amount || item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Taxes Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ width: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <span>Net Taxable Value:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{Number(document.netTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {((document as any).taxes || []).map((tax: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <span>{tax.account} ({tax.rate}%):</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{Number(tax.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 16, fontWeight: 800, color: '#2563eb', borderBottom: '2px solid #2563eb' }}>
                <span>Grand Total:</span>
                <span>₹{Number(document.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {(document as any).outstandingAmount !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
                  <span>Outstanding Balance:</span>
                  <span>₹{Number((document as any).outstandingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Footer */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, fontSize: 11.5, color: '#64748b', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div>
              <strong style={{ color: '#0f172a' }}>Terms &amp; Conditions:</strong>
              <div style={{ marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                1. Payment due within specified due date.<br />
                2. Delayed payment interest is chargeable at 1.5% per month.<br />
                3. Computer-generated tax document authorized by Curemaso ERP.
              </div>
            </div>
            <div style={{ textAlign: 'center', alignSelf: 'flex-end' }}>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 8, fontWeight: 600, color: '#0f172a' }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
