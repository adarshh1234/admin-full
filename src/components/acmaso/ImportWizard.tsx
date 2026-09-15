import React, { useState } from 'react';
import { acmasoApi } from '../../services/acmaso.service';
import { useToast } from '../../hooks/useToast';

type ImportEntity = 'Customer' | 'Supplier' | 'Item' | 'Account' | 'Sales Invoice' | 'Purchase Invoice' | 'Journal Entry';

const CSV_SAMPLES: Record<ImportEntity, string> = {
  Customer: `name,customer_name,email,phone,gstin,tax_id,billing_address,pan\nCUST-NEW-01,Alpha Technologies,info@alpha.com,9876543210,27AAAAA0000A1Z5,27AAAAA0000A1Z5,Mumbai Maharashtra,AAAAA0000A`,
  Supplier: `name,supplier_name,email,phone,gstin,pan,billing_address\nSUPP-NEW-01,Delta Infotech,sales@deltainfotech.com,9988776655,07AAAAA0000A1Z2,AAAAA0000A,New Delhi India`,
  Item: `name,item_name,description,unit,rate,hsn_code,item_group\nSRV-NEW-01,AI Consulting Service,Hourly AI Consulting,Hour,3500,998311,Services`,
  Account: `name,parent_account,root_type,account_type,is_group,currency\nAxis Bank Current Account,Bank Accounts - CURE,Asset,Bank,0,INR`,
  'Sales Invoice': `invoice_number,customer,date,due_date,place_of_supply,items\nINV-IMP-001,Alpha Technologies,2026-09-14,2026-09-30,Maharashtra,"[{""item_name"":""Consulting"",""quantity"":2,""rate"":2500,""amount"":5000,""gst_rate"":18}]"`,
  'Purchase Invoice': `invoice_number,supplier,date,due_date,place_of_supply,items\nBILL-IMP-001,Delta Infotech,2026-09-14,2026-09-30,Delhi,"[{""item_name"":""Server"",""quantity"":1,""rate"":12000,""amount"":12000,""gst_rate"":18}]"`,
  'Journal Entry': `voucher_type,date,user_remark,entries\nJournal Voucher,2026-09-14,Opening Balance,"[{""account"":""Bank of India - CURE"",""debit"":50000,""credit"":0},{""account"":""Retained Earnings - CURE"",""debit"":0,""credit"":50000}]"`
};

export const ImportWizard: React.FC = () => {
  const { showToast } = useToast();
  const [entity, setEntity] = useState<ImportEntity>('Customer');
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; imported: number; errors: Array<{ row: number; error: string }> } | null>(null);

  const handleDownloadSample = () => {
    const content = CSV_SAMPLES[entity];
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sample_${entity.replace(/\s+/g, '_')}.csv`;
    a.click();
    showToast(`Sample CSV for ${entity} downloaded`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content || '');
      showToast(`Loaded ${file.name}`, 'success');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      showToast('Please upload or paste CSV content first', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await acmasoApi.importData({ entity, csv_data: csvText });
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.errors.length === 0) {
          showToast(`Successfully imported ${res.data.imported} ${entity} records!`, 'success');
        } else {
          showToast(`Imported ${res.data.imported} records with ${res.data.errors.length} errors.`, 'info');
        }
      } else {
        showToast((res as any).error || 'Import failed', 'error');
      }
    } catch {
      showToast('Failed to execute import', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Preview parsed rows
  const parsedPreview = React.useMemo(() => {
    if (!csvText.trim()) return { headers: [], rows: [] };
    const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
    const rows = lines.slice(1, 6).map((line) => {
      return line.split(',').map((val) => val.replace(/^["']|["']$/g, '').trim());
    });
    return { headers, rows, totalLines: lines.length - 1 };
  }, [csvText]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-file-import" style={{ color: '#0d9488' }}></i>
            CSV Import Wizard
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Bulk import your Master records (Customers, Suppliers, Items, Accounts) or Historical Transactions via CSV.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="tab-btn" onClick={handleDownloadSample} style={{ padding: '6px 14px', fontSize: '12px' }}>
            <i className="fa-solid fa-download"></i> Download Sample CSV
          </button>
        </div>
      </div>

      {/* Wizard Form */}
      <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Select Entity to Import *
            </label>
            <select
              className="input"
              value={entity}
              onChange={(e) => {
                setEntity(e.target.value as ImportEntity);
                setCsvText(CSV_SAMPLES[e.target.value as ImportEntity]);
                setResult(null);
              }}
              style={{ width: '100%', padding: '8px 12px' }}
            >
              <option value="Customer">Customers</option>
              <option value="Supplier">Suppliers / Vendors</option>
              <option value="Item">Items & Services</option>
              <option value="Account">Chart of Accounts</option>
              <option value="Sales Invoice">Sales Invoices</option>
              <option value="Purchase Invoice">Purchase Invoices / Bills</option>
              <option value="Journal Entry">Journal Entries / Vouchers</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              style={{ fontSize: '12px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
            CSV Raw Data (Paste or edit directly)
          </label>
          <textarea
            className="input"
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste comma-separated CSV text here with headers..."
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '10px' }}
          />
        </div>

        {/* Live Preview Table */}
        {parsedPreview.headers.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Previewing top {parsedPreview.rows.length} of {parsedPreview.totalLines} record(s):
              </span>
            </div>
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    {parsedPreview.headers.map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', color: '#475569' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedPreview.rows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {row.map((cell, cidx) => (
                        <td key={cidx} style={{ padding: '8px 12px', color: '#0f172a' }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            className="tab-btn active"
            disabled={loading || !csvText.trim()}
            onClick={handleImport}
            style={{ padding: '10px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Importing {entity}...
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up"></i> Start CSV Import
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Result Summary Card */}
      {result && (
        <div className="panel" style={{ padding: '20px', borderLeft: result.errors.length === 0 ? '4px solid #16a34a' : '4px solid #f59e0b' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={`fa-solid ${result.errors.length === 0 ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} style={{ color: result.errors.length === 0 ? '#16a34a' : '#f59e0b' }}></i>
            Import Results Summary
          </h3>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginBottom: '16px' }}>
            <div>Total Records: <strong>{result.total}</strong></div>
            <div style={{ color: '#16a34a' }}>Successfully Imported: <strong>{result.imported}</strong></div>
            <div style={{ color: result.errors.length > 0 ? '#dc2626' : '#64748b' }}>Errors: <strong>{result.errors.length}</strong></div>
          </div>

          {result.errors.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '6px', fontSize: '13px' }}>Error Details:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#b91c1c' }}>
                {result.errors.map((err, i) => (
                  <li key={i}>Row {err.row}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
