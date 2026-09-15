import React, { useState, useEffect, useCallback } from 'react';
import { acmasoApi } from '../../services/acmaso.service';
import type { Gstr1ReportData } from '../../types/acmaso';
import { useToast } from '../../hooks/useToast';

export const GSTR1Report: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<Gstr1ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState<'b2b' | 'b2cl' | 'b2cs'>('b2b');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await acmasoApi.getGstr1({ from_date: fromDate, to_date: toDate });
      if (res && res.success && res.data) {
        setData(res.data);
      } else if (res && (res as any).totals) {
        // Direct response fallback
        setData(res as any);
      }
    } catch {
      showToast('Failed to load GSTR-1 data', 'error');
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
    total_amount: Number(
      data?.summary?.total_amount ??
      (data as any)?.totals?.totalInvoiceValue ??
      (data as any)?.totals?.total_amount ??
      0
    ),
  };

  // Safe Section Rows
  const allRows = Array.isArray(data?.rows) ? data.rows : [];
  const b2bRows = Array.isArray(data?.b2b) ? data.b2b : allRows.filter((r: any) => (r.type === 'B2B' || (!r.type && r.gstin)));
  const b2clRows = Array.isArray(data?.b2cl) ? data.b2cl : allRows.filter((r: any) => r.type === 'B2CL');
  const b2csRows = Array.isArray(data?.b2cs) ? data.b2cs : allRows.filter((r: any) => r.type === 'B2CS' || (!r.type && !r.gstin));

  const currentTabRows = activeTab === 'b2b' ? b2bRows : activeTab === 'b2cl' ? b2clRows : b2csRows;

  const exportJson = () => {
    const exportPayload = {
      period: data?.period || { from_date: fromDate, to_date: toDate },
      summary,
      b2b: b2bRows,
      b2cl: b2clRows,
      b2cs: b2csRows,
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `GSTR1_${fromDate || 'all'}_to_${toDate || 'all'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('GSTR-1 JSON downloaded', 'success');
  };

  const exportCsv = () => {
    let csv = "Invoice Number,Date,Customer,GSTIN,Place of Supply,Taxable Amount,IGST,CGST,SGST,Cess,Total Amount\n";
    currentTabRows.forEach((r: any) => {
      const invNo = r.invoice_number || r.invoiceNumber || '';
      const date = r.date || r.invoiceDate || '';
      const cust = r.customer_name || r.partyName || '';
      const gstin = r.gstin || '';
      const pos = r.place_of_supply || r.placeOfSupply || '';
      const taxable = Number(r.taxable_amount ?? r.taxableValue ?? 0);
      const igst = Number(r.igst ?? r.igstAmount ?? 0);
      const cgst = Number(r.cgst ?? r.cgstAmount ?? 0);
      const sgst = Number(r.sgst ?? r.sgstAmount ?? 0);
      const cess = Number(r.cess ?? 0);
      const total = Number(r.total_amount ?? r.invoiceValue ?? 0);

      csv += `"${invNo}","${date}","${cust}","${gstin}","${pos}","${taxable}","${igst}","${cgst}","${sgst}","${cess}","${total}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${activeTab.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast(`${activeTab.toUpperCase()} CSV downloaded`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Filter Bar */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#0d9488' }}></i>
            GSTR-1 (Outward Supplies Return)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Outward supplies summary for GST filing (B2B, B2CL, B2CS).
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
          <button className="tab-btn" onClick={exportCsv} style={{ padding: '6px 12px', fontSize: '12px' }}>
            <i className="fa-solid fa-file-csv"></i> Export CSV
          </button>
          <button className="tab-btn active" onClick={exportJson} style={{ padding: '6px 14px', fontSize: '12px' }}>
            <i className="fa-solid fa-file-code"></i> JSON (Govt Portal)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #0d9488' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TOTAL TAXABLE VALUE</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            ₹{summary.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>IGST</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            ₹{summary.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CGST + SGST</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            ₹{(summary.cgst + summary.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="panel" style={{ padding: '14px', borderLeft: '4px solid #6366f1' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TOTAL INVOICE VALUE</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            ₹{summary.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Sub-tabs for B2B, B2CL, B2CS */}
      <div className="tab-nav" style={{ margin: 0 }}>
        <button
          className={`tab-btn ${activeTab === 'b2b' ? 'active' : ''}`}
          onClick={() => setActiveTab('b2b')}
        >
          <i className="fa-solid fa-building"></i> 4A, 4B, 4C, 6B, 6C - B2B Invoices ({b2bRows.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'b2cl' ? 'active' : ''}`}
          onClick={() => setActiveTab('b2cl')}
        >
          <i className="fa-solid fa-users"></i> 5A, 5B - B2C Large ({b2clRows.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'b2cs' ? 'active' : ''}`}
          onClick={() => setActiveTab('b2cs')}
        >
          <i className="fa-solid fa-user-tag"></i> 7 - B2C Small ({b2csRows.length})
        </button>
      </div>

      {/* Table */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Invoice No</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Customer Name</th>
                <th style={{ padding: '12px 16px' }}>GSTIN</th>
                <th style={{ padding: '12px 16px' }}>POS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Taxable Amt (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>IGST (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>CGST (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>SGST (₹)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading GSTR-1 Data...
                  </td>
                </tr>
              ) : currentTabRows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No outward supply records found for this section and period.
                  </td>
                </tr>
              ) : (
                currentTabRows.map((row: any, idx: number) => {
                  const invNo = row.invoice_number || row.invoiceNumber || '—';
                  const date = row.date || row.invoiceDate || '—';
                  const custName = row.customer_name || row.partyName || '—';
                  const gstin = row.gstin || '—';
                  const pos = row.place_of_supply || row.placeOfSupply || '—';
                  const taxable = Number(row.taxable_amount ?? row.taxableValue ?? 0);
                  const igst = Number(row.igst ?? row.igstAmount ?? 0);
                  const cgst = Number(row.cgst ?? row.cgstAmount ?? 0);
                  const sgst = Number(row.sgst ?? row.sgstAmount ?? 0);
                  const total = Number(row.total_amount ?? row.invoiceValue ?? 0);

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{invNo}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{date}</td>
                      <td style={{ padding: '12px 16px' }}>{custName}</td>
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
