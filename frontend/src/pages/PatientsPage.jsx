import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [requestingId, setRequestingId] = useState(null);
  const [form, setForm] = useState({ name: '', dob: '', gender: 'Male', contact: '', address: '', blood_group: '', emergency_contact: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/patients?search=${search}&page=1&limit=50`);
    setPatients(Array.isArray(data) ? data : (data.patients || []));
    } catch (err) { setError('Failed to load patients.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault(); setError('');
    try {
      await API.post('/patients', form);
      setShowForm(false);
      setForm({ name: '', dob: '', gender: 'Male', contact: '', address: '', blood_group: '', emergency_contact: '' });
      fetchPatients();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add patient.'); }
  };

  const handleRequestAccess = async (patientId, e) => {
    e.stopPropagation(); setRequestingId(patientId);
    try {
      await API.post('/access/request', { patient_id: patientId, reason: 'Requesting access to view patient records.' });
      fetchPatients();
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit request.'); }
    finally { setRequestingId(null); }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete patient "' + name + '"?')) return;
    try { await API.delete('/patients/' + id); fetchPatients(); }
    catch (err) { alert('Failed to delete patient.'); }
  };

  const filtered = patients.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'mine') return p.access_status === 'assigned';
    if (filter === 'full') return p.access_status === 'approved';
    if (filter === 'pending') return p.access_status === 'pending';
    if (filter === 'limited') return p.access_status === 'none';
    return true;
  });

  const ACCESS_CONFIG = {
    assigned: { label: 'Your Patient', bg: '#eff6ff', color: '#2563eb' },
    approved: { label: 'Full Access',  bg: '#f0fdf4', color: '#16a34a' },
    pending:  { label: 'Pending',      bg: '#fffbeb', color: '#d97706' },
    none:     { label: 'Limited',      bg: '#fef2f2', color: '#dc2626' },
  };

  const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Patient Directory</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0 0' }}>{patients.length} patients found</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '+ Add Patient'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>New Patient</h3>
            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={lbl}>Full Name *</label><input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required style={inp} /></div>
                <div><label style={lbl}>Contact</label><input name="contact" placeholder="Phone" value={form.contact} onChange={handleChange} style={inp} /></div>
                <div><label style={lbl}>Blood Group</label><input name="blood_group" placeholder="e.g. O+" value={form.blood_group} onChange={handleChange} style={inp} /></div>
                <div><label style={lbl}>Emergency Contact</label><input name="emergency_contact" placeholder="Emergency phone" value={form.emergency_contact} onChange={handleChange} style={inp} /></div>
                <div><label style={lbl}>Date of Birth</label><input type="date" name="dob" value={form.dob} onChange={handleChange} style={inp} /></div>
                <div><label style={lbl}>Gender</label><select name="gender" value={form.gender} onChange={handleChange} style={inp}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Address</label><input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={inp} /></div>
              </div>
              {error && <p style={{ color: 'var(--red)', fontSize: 13, margin: '0 0 12px 0' }}>{error}</p>}
              <button type="submit" style={{ padding: '9px 22px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginRight: 10 }}>Save</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </form>
          </div>
        )}

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={user?.role === 'doctor' ? 'Search by name or hospital...' : 'Search by name or contact...'}
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
        </div>

        {user?.role === 'doctor' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All', count: patients.length, color: '#2563eb', bg: '#eff6ff' },
              { key: 'mine', label: 'Your Patients', count: patients.filter(p => p.access_status === 'assigned').length, color: '#2563eb', bg: '#eff6ff' },
              { key: 'full', label: 'Full Access', count: patients.filter(p => p.access_status === 'approved').length, color: '#16a34a', bg: '#f0fdf4' },
              { key: 'pending', label: 'Pending', count: patients.filter(p => p.access_status === 'pending').length, color: '#d97706', bg: '#fffbeb' },
              { key: 'limited', label: 'Limited', count: patients.filter(p => p.access_status === 'none').length, color: '#dc2626', bg: '#fef2f2' },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: filter === f.key ? f.bg : 'var(--card)', border: filter === f.key ? '1.5px solid ' + f.color : '1px solid var(--border2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: filter === f.key ? f.color : 'var(--text2)' }}>
                {f.label}
                <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: filter === f.key ? f.color : 'var(--bg3)', color: filter === f.key ? '#fff' : 'var(--text3)' }}>{f.count}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text2)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0' }}>No patients found</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>Try a different search or filter</p>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                  {['Patient', 'Age', 'Gender', 'Rare Disease', user?.role === 'doctor' ? 'Hospital' : 'Blood Group', 'Access Level', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '13px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const canView = p.access_status === 'assigned' || p.access_status === 'approved' || user?.role === 'hospital';
                  const ac = user?.role === 'hospital' ? { label: 'Full Access', bg: '#f0fdf4', color: '#16a34a' } : (ACCESS_CONFIG[p.access_status] || ACCESS_CONFIG.none);
                  return (
                    <tr key={p.id}
                      onClick={canView ? () => navigate('/patients/' + p.id) : undefined}
                      onMouseEnter={(e) => { if (canView) e.currentTarget.style.background = 'var(--bg4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg2)' : 'transparent'; }}
                      style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg2)' : 'transparent', cursor: canView ? 'pointer' : 'default' }}>

                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: ac.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{p.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>ID #{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>{p.age ? p.age + ' yrs' : '—'}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>{p.gender || '—'}</td>
                      <td style={{ padding: '13px 16px' }}>
                        {p.disease_names
                          ? <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>🧬 {p.disease_names}</span>
                          : <span style={{ color: 'var(--text3)' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                        {user?.role === 'doctor' ? (p.hospital_name || '—') : (p.blood_group || '—')}
                      </td>
                      <td style={{ padding: '13px 16px' }} onClick={(e) => e.stopPropagation()}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ac.bg, color: ac.color, border: '1px solid ' + ac.color + '40' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ac.color }} />
                          {ac.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }} onClick={(e) => e.stopPropagation()}>
                        {user?.role === 'hospital' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => navigate('/patients/' + p.id)} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View</button>
                            <button onClick={(e) => handleDelete(p.id, p.name, e)} style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                          </div>
                        )}
                        {user?.role === 'doctor' && canView && (
                          <button onClick={() => navigate('/patients/' + p.id)} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View Record</button>
                        )}
                        {user?.role === 'doctor' && p.access_status === 'pending' && (
                          <button disabled style={{ padding: '6px 14px', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'not-allowed' }}>⏳ Pending</button>
                        )}
                        {user?.role === 'doctor' && p.access_status === 'none' && (
                          <button onClick={(e) => handleRequestAccess(p.id, e)} disabled={requestingId === p.id} style={{ padding: '6px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {requestingId === p.id ? 'Sending...' : '🔐 Request Access'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Showing <strong>{filtered.length}</strong> of <strong>{patients.length}</strong> patients</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
