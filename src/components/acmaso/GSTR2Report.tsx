import React, { useState, useEffect, useCallback } from 'react';
import { acmasoApi } from '../../services/acmaso.service';
import type { Gstr2ReportData } from '../../types/acmaso';
import { useToast } from '../../hooks/useToast';

export const GSTR2Report: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<Gstr2ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await acmasoApi.getGstr2({ from_date: fromDate, to_date: toDate });
      if (res && res.success && res.data) {
        setData(res.data);
      } else if (res && (res as any).totals) {
        // Direct response fallback
        setData(res as any);
      }
    } catch {
      showToast('Failed to load GSTR-2 data', 'error');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Safe Normalized Summary with non-null numbers
  const summary = {
    taxable_amount: Number(
      data?.summary?.taxable_amount ??
      (data as any)?.totals?.totalTaxableValue ??
      (data as any)?.totals?.taxable_amount ??
      0
    ),
    igst: Number(
      data?.summary?.igst ??
      (data as any)?.totals?.totalIgst ??
      (data as any)?.totals?.igst ??
      0
    ),
    cgst: Number(
      data?.summary?.cgst ??
      (data as any)?.totals?.totalCgst ??
      (data as any)?.totals?.cgst ??
      0
    ),
    sgst: Number(
      data?.summary?.sgst ??
      (data as any)?.totals?.totalSgst ??
      (data as any)?.totals?.sgst ??
      0
    ),
    cess: Number(
      data?.summary?.cess ??
      (data as any)?.totals?.totalCess ??
      0
    ),
    total_itc_available: Number(
      data?.summary?.total_itc_available ??
      (data as any)?.totals?.totalItcAvailable ??
      (data as any)?.totals?.total_itc_available ??
      (data as any)?.totals?.totalTax ??
      0
    ),
    total_amount: Number(
      data?.summary?.total_amount ??
      (data as any)?.totals?.totalInvoiceValue ??
      (data as any)?.totals?.total_amount ??
      0
    ),
  };

  const inwardSupplies = Array.isArray(data?.inward_supplies)
    ? data.inward_supplies
    : Array.isArray(data?.rows)
    ? data.rows
    : [];

  const exportCsv = () => {
    let csv = "Invoice Number,Date,Supplier,GSTIN,Place of Supply,Taxable Amount,IGST,CGST,SGST,Cess,Eligible ITC,Total Amount\n";
    inwardSupplies.forEach((r: any) => {
      const invNo = r.invoice_number || r.invoiceNumber || '';
      const date = r.date || r.invoiceDate || '';
      const supp = r.supplier_name || r.supplierName || r.partyName || '';
      const gstin = r.gstin || '';
      const pos = r.place_of_supply || r.placeOfSupply || '';
      const taxable = Number(r.taxable_amount ?? r.taxableValue ?? 0);
      const igst = Number(r.igst ?? r.igstAmount ?? 0);
      const cgst = Number(r.cgst ?? r.cgstAmount ?? 0);
      const sgst = Number(r.sgst ?? r.sgstAmount ?? 0);
      const cess = Number(r.cess ?? 0);
      const itc = r.itc_eligible ?? r.itcEligible ?? true ? 'Yes' : 'No';
      const total = Number(r.total_amount ?? r.invoiceValue ?? 0);

      csv += `"${invNo}","${date}","${supp}","${gstin}","${pos}","${taxable}","${igst}","${cgst}","${sgst}","${cess}","${itc}","${total}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR2_InwardSupplies_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('GSTR-2 CSV downloaded', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Filter Bar */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-receipt" style={{ color: '#0284c7' }}></i>
            GSTR-2 (Inward Supplies & Input Tax Credit)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Inward supplies summary and Input Tax Credit (ITC) eligibility report.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: '140px', fontSize: '12px', padding: '6px 10px' }}
          />
          <span style={{ fontSize: '12px', color: '#64748b' }}>to</span>
          <input
            type="date"
            className="input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: '140px', fontSize: '12px', padding: '6px 10px' }}
          />
          <button className="tab-btn" onClick={loadData} style={{ padding: '6px 12px', fontSize: '12px' }}>
            <i className="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
          <button className="tab-btn active" onClick={exportCsv} style={{ padding: '6px 14px', fontSize: '12px' }}>
            <i className="fa-solid fa-file-csv"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TAXABLE PURCHASE VALUE</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            ₹{summary.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>INPUT IGST</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            ₹{summary.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>INPUT CGST + SGST</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            ₹{(summary.cgst + summary.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TOTAL ELIGIBLE ITC</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
            ₹{summary.total_itc_available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Supplier Invoice No</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Supplier Name</th>
                <th style={{ padding: '12px 16px' }}>GSTIN</th>
                <th style={{ padding: '12px 16px' }}>POS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Taxable Amt (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>IGST (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>CGST (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>SGST (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>ITC Eligible</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading GSTR-2 Data...
                  </td>
                </tr>
              ) : inwardSupplies.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No inward supply records found for this period.
                  </td>
                </tr>
              ) : (
                inwardSupplies.map((row: any, idx: number) => {
                  const invNo = row.invoice_number || row.invoiceNumber || '—';
                  const date = row.date || row.invoiceDate || '—';
                  const suppName = row.supplier_name || row.supplierName || row.partyName || '—';
                  const gstin = row.gstin || '—';
                  const pos = row.place_of_supply || row.placeOfSupply || '—';
                  const taxable = Number(row.taxable_amount ?? row.taxableValue ?? 0);
                  const igst = Number(row.igst ?? row.igstAmount ?? 0);
                  const cgst = Number(row.cgst ?? row.cgstAmount ?? 0);
                  const sgst = Number(row.sgst ?? row.sgstAmount ?? 0);
                  const isEligible = row.itc_eligible ?? row.itcEligible ?? true;
                  const total = Number(row.total_amount ?? row.invoiceValue ?? 0);

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{invNo}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{date}</td>
                      <td style={{ padding: '12px 16px' }}>{suppName}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{gstin}</td>
                      <td style={{ padding: '12px 16px' }}>{pos}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {igst > 0 ? igst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {cgst > 0 ? cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {sgst > 0 ? sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: isEligible ? '#dcfce7' : '#fee2e2',
                          color: isEligible ? '#15803d' : '#b91c1c'
                        }}>
                          {isEligible ? 'Eligible' : 'Ineligible'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                        {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
