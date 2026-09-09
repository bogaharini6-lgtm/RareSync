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
  const [form, setForm] = useState({
    name: '', dob: '', gender: 'Male', contact: '',
    address: '', blood_group: '', emergency_contact: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/patients?search=${search}`);
      setPatients(data);
    } catch (err) {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/patients', form);
      setShowForm(false);
      setForm({ name: '', dob: '', gender: 'Male', contact: '', address: '', blood_group: '', emergency_contact: '' });
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient.');
    }
  };

  const handleRequestAccess = async (patientId, e) => {
    e.stopPropagation();
    setRequestingId(patientId);
    try {
      await API.post('/access/request', {
        patient_id: patientId,
        reason: 'Requesting access to view patient records.',
      });
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setRequestingId(null);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete patient "${name}"?`)) return;
    try {
      await API.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert('Failed to delete patient.');
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'assigned') return p.access_status === 'assigned';
    if (filter === 'approved') return p.access_status === 'approved';
    if (filter === 'pending') return p.access_status === 'pending';
    if (filter === 'none') return p.access_status === 'none';
    return true;
  });

  const counts = {
    all: patients.length,
    assigned: patients.filter(p => p.access_status === 'assigned').length,
    approved: patients.filter(p => p.access_status === 'approved').length,
    pending: patients.filter(p => p.access_status === 'pending').length,
    none: patients.filter(p => p.access_status === 'none').length,
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.pageTitle}>
              {user?.role === 'doctor' ? 'All Patients' : 'Patients'}
            </h2>
            <p style={styles.pageSubtitle}>
              {user?.role === 'doctor'
                ? 'Browse patients across all hospitals — request access to view full records'
                : 'Manage all patients in your hospital'}
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Patient'}
          </button>
        </div>

        {/* Add Patient Form */}
        {showForm && (
          <form onSubmit={handleAdd} style={styles.formBox}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: 15 }}>Add New Patient</h3>
            <div style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label}>Full Name *</label>
                <input style={styles.input} name="name" placeholder="Enter full name" value={form.name} onChange={handleChange} required />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Date of Birth</label>
                <input style={styles.input} name="dob" type="date" value={form.dob} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Gender</label>
                <select style={styles.input} name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Contact Number</label>
                <input style={styles.input} name="contact" placeholder="Phone number" value={form.contact} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Blood Group</label>
                <input style={styles.input} name="blood_group" placeholder="e.g. O+" value={form.blood_group} onChange={handleChange} />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Emergency Contact</label>
                <input style={styles.input} name="emergency_contact" placeholder="Emergency phone" value={form.emergency_contact} onChange={handleChange} />
              </div>
              <div style={{ ...styles.formField, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Address</label>
                <input style={styles.input} name="address" placeholder="Full address" value={form.address} onChange={handleChange} />
              </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={styles.saveBtn}>Save Patient</button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </form>
        )}

        {/* Search */}
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            placeholder={user?.role === 'doctor' ? 'Search by patient name or hospital...' : 'Search by name or contact...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Doctor Filter Tabs */}
        {user?.role === 'doctor' && (
          <div style={styles.filterRow}>
            {[
              { key: 'all',      label: 'All Patients',   color: 'var(--accent)' },
              { key: 'assigned', label: 'Your Patients',  color: 'var(--accent)' },
              { key: 'approved', label: 'Full Access',    color: 'var(--green)'  },
              { key: 'pending',  label: 'Pending',        color: 'var(--orange)' },
              { key: 'none',     label: 'Limited Access', color: 'var(--red)'    },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  ...styles.filterTab,
                  ...(filter === f.key ? { background: 'var(--bg3)', borderColor: f.color, color: f.color, fontWeight: 700 } : {}),
                }}
              >
                {f.label}
                <span style={{
                  ...styles.filterBadge,
                  background: filter === f.key ? f.color : 'var(--bg4)',
                  color: filter === f.key ? '#fff' : 'var(--text3)',
                }}>
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={styles.loadingBox}>
            <p style={{ color: 'var(--text2)' }}>Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>👤</div>
            <p style={styles.emptyTitle}>No patients found</p>
            <p style={styles.emptyDesc}>
              {filter !== 'all' ? 'Try a different filter tab' : 'No patients registered yet'}
            </p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Age</th>
                  <th style={styles.th}>Gender</th>
                  <th style={styles.th}>Rare Disease</th>
                  {user?.role === 'doctor' && <th style={styles.th}>Hospital</th>}
                  {user?.role === 'hospital' && <th style={styles.th}>Blood Group</th>}
                  <th style={styles.th}>Access</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, index) => {
                  const isClickable =
                    p.access_status === 'assigned' ||
                    p.access_status === 'approved' ||
                    user?.role === 'hospital';

                  return (
                    <tr
                      key={p.id}
                      style={{
                        ...styles.tr,
                        background: index % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)',
                        cursor: isClickable ? 'pointer' : 'default',
                      }}
                      onClick={isClickable ? () => navigate(`/patients/${p.id}`) : undefined}
                    >
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          <div style={{
                            ...styles.avatar,
                            background:
                              p.access_status === 'assigned' ? 'var(--accent)' :
                              p.access_status === 'approved' ? 'var(--green)' :
                              p.access_status === 'pending' ? 'var(--orange)' :
                              'var(--text3)',
                          }}>
                            {p.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={styles.patientName}>{p.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.cellText}>{p.age ? `${p.age} yrs` : '—'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.cellText}>{p.gender || '—'}</span>
                      </td>
                      <td style={styles.td}>
                        {p.disease_names ? (
                          <span style={styles.diseaseBadge}>🧬 {p.disease_names}</span>
                        ) : (
                          <span style={styles.noneText}>—</span>
                        )}
                      </td>
                      {user?.role === 'doctor' && (
                        <td style={styles.td}>
                          <span style={styles.hospitalText}>🏥 {p.hospital_name}</span>
                        </td>
                      )}
                      {user?.role === 'hospital' && (
                        <td style={styles.td}>
                          <span style={styles.cellText}>{p.blood_group || '—'}</span>
                        </td>
                      )}
                      <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                        {user?.role === 'hospital' ? (
                          <span style={{ ...styles.badge, ...styles.badgeFull }}>Full Access</span>
                        ) : p.access_status === 'assigned' ? (
                          <span style={{ ...styles.badge, ...styles.badgeAssigned }}>Your Patient</span>
                        ) : p.access_status === 'approved' ? (
                          <span style={{ ...styles.badge, ...styles.badgeFull }}>Full Access</span>
                        ) : p.access_status === 'pending' ? (
                          <span style={{ ...styles.badge, ...styles.badgePending }}>Pending</span>
                        ) : (
                          <span style={{ ...styles.badge, ...styles.badgeLimited }}>Limited</span>
                        )}
                      </td>
                      <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                        {user?.role === 'hospital' && (
                          <div style={styles.actionRow}>
                            <button onClick={() => navigate(`/patients/${p.id}`)} style={styles.viewBtn}>View</button>
                            <button onClick={(e) => handleDelete(p.id, p.name, e)} style={styles.deleteBtn}>Delete</button>
                          </div>
                        )}
                        {user?.role === 'doctor' && (
                          <>
                            {(p.access_status === 'assigned' || p.access_status === 'approved') && (
                              <button onClick={() => navigate(`/patients/${p.id}`)} style={styles.viewBtn}>View Record</button>
                            )}
                            {p.access_status === 'pending' && (
                              <button style={styles.pendingBtn} disabled>⏳ Pending</button>
                            )}
                            {p.access_status === 'none' && (
                              <button
                                onClick={(e) => handleRequestAccess(p.id, e)}
                                style={styles.requestBtn}
                                disabled={requestingId === p.id}
                              >
                                {requestingId === p.id ? '...' : '🔐 Request'}
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredPatients.length > 0 && (
          <p style={styles.footerCount}>
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  container: { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 },
  pageSubtitle: { fontSize: 13, color: 'var(--text2)', margin: '4px 0 0 0' },
  addBtn: { padding: '10px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  formBox: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 },
  formField: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border2)', fontSize: 13, background: 'var(--bg3)', color: 'var(--text)', boxSizing: 'border-box' },
  error: { color: 'var(--red)', fontSize: 13, marginBottom: 10 },
  saveBtn: { padding: '9px 20px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  cancelBtn: { padding: '9px 16px', background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border2)', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  searchBox: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '0 14px', marginBottom: 14 },
  searchIcon: { fontSize: 14, flexShrink: 0 },
  searchInput: { flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none' },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterTab: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text2)', fontWeight: 600 },
  filterBadge: { padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700 },
  loadingBox: { padding: 40, textAlign: 'center' },
  emptyBox: { padding: '48px 24px', textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0' },
  emptyDesc: { fontSize: 13, color: 'var(--text3)', margin: 0 },
  tableWrap: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'var(--bg3)' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid var(--border)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '13px 16px', fontSize: 13, color: 'var(--text)', verticalAlign: 'middle' },
  nameCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 },
  patientName: { fontWeight: 700, color: 'var(--text)', fontSize: 13 },
  cellText: { color: 'var(--text2)', fontSize: 13 },
  noneText: { color: 'var(--text3)', fontSize: 13 },
  diseaseBadge: { display: 'inline-block', background: 'var(--pbg)', color: 'var(--purple)', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid var(--pborder)' },
  hospitalText: { fontSize: 12, color: 'var(--text2)' },
  badge: { padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 },
  badgeAssigned: { background: 'var(--bg4)', color: 'var(--accent)', border: '1px solid var(--border2)' },
  badgeFull: { background: 'var(--gbg)', color: 'var(--green)', border: '1px solid var(--gborder)' },
  badgePending: { background: 'var(--obg)', color: 'var(--orange)', border: '1px solid var(--oborder)' },
  badgeLimited: { background: 'var(--rbg)', color: 'var(--red)', border: '1px solid var(--rborder)' },
  actionRow: { display: 'flex', gap: 6 },
  viewBtn: { padding: '6px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  requestBtn: { padding: '6px 12px', background: 'var(--bg4)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  pendingBtn: { padding: '6px 12px', background: 'var(--obg)', color: 'var(--orange)', border: '1px solid var(--oborder)', borderRadius: 6, cursor: 'not-allowed', fontSize: 12, fontWeight: 700 },
  deleteBtn: { padding: '6px 12px', background: 'var(--rbg)', color: 'var(--red)', border: '1px solid var(--rborder)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  footerCount: { color: 'var(--text3)', fontSize: 12, marginTop: 12, textAlign: 'right' },
};