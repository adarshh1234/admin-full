import React, { useEffect, useState } from 'react';
import { acmasoService } from '../../services/acmaso.service';
import type { Party, PartyRole } from '../../types/acmaso';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const Parties: React.FC = () => {
  const { showToast } = useToast();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<PartyRole>('Customer');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await acmasoService.getParties(roleFilter);
      setParties(res);
    } catch (err: any) {
      showToast('Failed to load party list.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingParty(null);
    setName('');
    setRole('Customer');
    setGstin('');
    setPan('');
    setEmail('');
    setPhone('');
    setAddress('');
    setPlaceOfSupply('Maharashtra');
    setShowModal(true);
  }

  function handleOpenEdit(party: Party) {
    setEditingParty(party);
    setName(party.name);
    setRole(party.role);
    setGstin(party.gstin || '');
    setPan(party.pan || '');
    setEmail(party.email || '');
    setPhone(party.phone || '');
    setAddress(party.address || '');
    setPlaceOfSupply(party.placeOfSupply || 'Maharashtra');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      showToast('Party name is required.', 'error');
      return;
    }

    try {
      const payload = {
        name,
        role,
        gstin,
        pan,
        email,
        phone,
        address,
        placeOfSupply,
        defaultAccount: role === 'Supplier' ? 'Creditors' : 'Debtors',
      };

      if (editingParty) {
        await acmasoService.updateParty(editingParty.id, payload);
        showToast('Party master record updated.', 'success');
      } else {
        await acmasoService.createParty(payload);
        showToast('New party created successfully.', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast(`Action failed: ${err.message}`, 'error');
    }
  }

  async function handleDelete(party: Party) {
    if (!window.confirm(`Delete party record for ${party.name}?`)) return;
    try {
      await acmasoService.deleteParty(party.id);
      showToast('Party deleted.', 'info');
      loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  const filtered = parties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.gstin || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || '').includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls & Role Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Input
              type="text"
              placeholder="Search parties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 32, fontSize: 13, height: 38, width: '100%' }}
            />
            <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }} />
          </div>

          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
            {['All', 'Customer', 'Supplier', 'Both'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: roleFilter === r ? 700 : 500,
                  background: roleFilter === r ? '#ffffff' : 'transparent',
                  color: roleFilter === r ? '#2563eb' : '#64748b',
                  boxShadow: roleFilter === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {r === 'All' ? 'All Parties' : `${r}s`}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" onClick={handleOpenCreate}>
          <i className="fas fa-plus" style={{ marginRight: 6 }} /> Add Party
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Loader label="Loading parties..." />
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  {['Party Name', 'Role', 'GSTIN / PAN', 'Email & Phone', 'Place of Supply', 'Outstanding (₹)', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: h.includes('(₹)') ? 'right' : 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.name}</div>
                      {p.address && <div style={{ fontSize: 11, color: '#64748b' }}>{p.address.slice(0, 40)}...</div>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: p.role === 'Customer' ? '#eff6ff' : p.role === 'Supplier' ? '#fef3c7' : '#f3e8ff',
                          color: p.role === 'Customer' ? '#2563eb' : p.role === 'Supplier' ? '#b45309' : '#7e22ce',
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>{p.gstin || '—'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{p.pan || ''}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ color: '#1e293b' }}>{p.email || '—'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{p.phone || ''}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{p.placeOfSupply || 'Maharashtra'}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: (p.outstandingAmount || 0) > 0 ? (p.role === 'Supplier' ? '#d97706' : '#dc2626') : '#16a34a' }}>
                      ₹{Number(p.outstandingAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ fontSize: 11.5, padding: '4px 8px', marginRight: 6 }}
                        onClick={() => handleOpenEdit(p)}
                      >
                        <i className="fas fa-edit" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ fontSize: 11.5, padding: '4px 8px', color: '#ef4444', borderColor: '#ef4444' }}
                        onClick={() => handleDelete(p)}
                      >
                        <i className="fas fa-trash-alt" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                      No party records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {editingParty ? 'Edit Party Master' : 'Create Party Master'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Party Name *</label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Apollo Health City or Siemens Healthineers" style={{ width: '100%', height: 38 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Party Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as PartyRole)}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                  >
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Both">Both (Customer &amp; Supplier)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Place of Supply</label>
                  <select
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 10px', fontSize: 13 }}
                  >
                    {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Rajasthan'].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>GSTIN (15 Characters)</label>
                  <Input type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="27AAACA1234A1Z1" style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>PAN</label>
                  <Input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="AAACA1234A" style={{ width: '100%', height: 38 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Email Address</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@party.com" style={{ width: '100%', height: 38 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Phone</label>
                  <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 22 1234 5678" style={{ width: '100%', height: 38 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Address..."
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Party</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
