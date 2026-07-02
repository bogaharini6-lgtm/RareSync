import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STATUS_STYLES = {
  Pending:  { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  Approved: { bg: '#f0fff4', color: '#22c55e', border: '#86efac' },
  Rejected: { bg: '#fff0f0', color: '#e53e3e', border: '#fca5a5' },
};

export default function AccessRequestsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  // Doctor — request access form
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const url = user?.role === 'hospital'
        ? `/access/hospital${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
        : '/access/my-requests';
      const { data } = await API.get(url);
      setRequests(data);
    } catch (err) {
      setError('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await API.get('/patients');
      setPatients(data);
    } catch (err) {
      console.error('Could not load patients');
    }
  };

  useEffect(() => {
    fetchRequests();
    if (user?.role === 'doctor') fetchPatients();
  }, [statusFilter]);

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await API.post('/access/request', form);
      setFormSuccess('Access request submitted successfully.');
      setForm({ patient_id: '', reason: '' });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit request.');
    }
  };

  const handleResolve = async (id, status) => {
    const action = status === 'Approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      await API.put(`/access/${id}/resolve`, { status });
      fetchRequests();
    } catch (err) {
      alert('Failed to update request.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <h1 style={styles.logo}>RareSync</h1>
        <div style={styles.topRight}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={() => navigate('/patients')} style={styles.navBtn}>Patients</button>
          <button onClick={() => navigate('/diseases')} style={styles.navBtn}>Diseases</button>
          {user?.role === 'hospital' && (
            <button onClick={() => navigate('/audit-logs')} style={styles.navBtn}>Audit Logs</button>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={{ margin: 0 }}>Access Requests</h2>
          {user?.role === 'doctor' && (
            <button onClick={() => { setShowForm(!showForm); setFormError(''); setFormSuccess(''); }} style={styles.addBtn}>
              {showForm ? 'Cancel' : '+ Request Access'}
            </button>
          )}
        </div>

        {/* Doctor — Request Access Form */}
        {showForm && user?.role === 'doctor' && (
          <form onSubmit={handleRequestAccess} style={styles.formBox}>
            <h3 style={{ marginTop: 0 }}>Request Patient Access</h3>
            <select
              style={styles.input}
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.contact || 'No contact'}</option>
              ))}
            </select>
            <textarea
              style={{ ...styles.input, marginTop: 12, resize: 'vertical', fontFamily: 'Arial' }}
              placeholder="Reason for access request (optional but recommended)"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
            />
            {formError && <p style={styles.error}>{formError}</p>}
            {formSuccess && <p style={styles.success}>{formSuccess}</p>}
            <button type="submit" style={{ ...styles.addBtn, marginTop: 12 }}>
              Submit Request
            </button>
          </form>
        )}

        {formSuccess && !showForm && (
          <div style={styles.successBanner}>{formSuccess}</div>
        )}

        {/* Filter Tabs — Hospital only */}
        {user?.role === 'hospital' && (
          <div style={styles.filterTabs}>
            {['all', 'Pending', 'Approved', 'Rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  ...styles.filterTab,
                  ...(statusFilter === s ? styles.filterTabActive : {}),
                }}
              >
                {s === 'all' ? 'All Requests' : s}
              </button>
            ))}
          </div>
        )}

        {/* Stats Row — Hospital only */}
        {user?.role === 'hospital' && (
          <div style={styles.statsRow}>
            {['Pending', 'Approved', 'Rejected'].map((s) => {
              const count = requests.filter((r) => r.status === s).length;
              const st = STATUS_STYLES[s];
              return (
                <div key={s} style={{ ...styles.statCard, background: st.bg, border: `1px solid ${st.border}` }}>
                  <p style={{ ...styles.statNumber, color: st.color }}>{count}</p>
                  <p style={{ ...styles.statLabel, color: st.color }}>{s}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Requests List */}
        {loading ? (
          <p style={{ color: '#888' }}>Loading requests...</p>
        ) : error ? (
          <p style={{ color: '#e53e3e' }}>{error}</p>
        ) : filteredRequests.length === 0 ? (
          <p style={{ color: '#999' }}>No access requests found.</p>
        ) : (
          filteredRequests.map((r) => {
            const st = STATUS_STYLES[r.status] || STATUS_STYLES.Pending;
            return (
              <div key={r.id} style={styles.requestCard}>
                <div style={styles.requestTop}>
                  <div style={styles.requestInfo}>
                    {/* Hospital sees doctor name, doctor sees patient name */}
                    {user?.role === 'hospital' ? (
                      <div>
                        <p style={styles.requestName}>Dr. {r.doctor_name}</p>
                        <p style={styles.requestSub}>{r.specialization || 'General'}</p>
                      </div>
                    ) : (
                      <div>
                        <p style={styles.requestName}>Patient: {r.patient_name}</p>
                        <p style={styles.requestSub}>{r.hospital_name}</p>
                      </div>
                    )}
                  </div>

                  <div style={styles.requestRight}>
                    <span style={{
                      ...styles.statusBadge,
                      background: st.bg,
                      color: st.color,
                      border: `1px solid ${st.border}`,
                    }}>
                      {r.status}
                    </span>
                  </div>
                </div>

                {user?.role === 'hospital' && (
                  <p style={styles.requestPatient}>
                    Requesting access to: <strong>{r.patient_name}</strong>
                  </p>
                )}

                {r.reason && (
                  <p style={styles.requestReason}>Reason: {r.reason}</p>
                )}

                <div style={styles.requestFooter}>
                  <span style={styles.requestDate}>
                    Requested: {new Date(r.requested_at).toLocaleString()}
                  </span>
                  {r.resolved_at && (
                    <span style={styles.requestDate}>
                      Resolved: {new Date(r.resolved_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Hospital approve / reject buttons */}
                {user?.role === 'hospital' && r.status === 'Pending' && (
                  <div style={styles.actionRow}>
                    <button
                      onClick={() => handleResolve(r.id, 'Approved')}
                      style={styles.approveBtn}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleResolve(r.id, 'Rejected')}
                      style={styles.rejectBtn}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e5e5e5',
  },
  logo: { color: '#2c7be5', margin: 0, fontSize: 22 },
  topRight: { display: 'flex', alignItems: 'center', gap: 10 },
  userName: { color: '#444', fontSize: 14, marginRight: 4 },
  navBtn: {
    padding: '7px 14px', background: '#f0f4ff', border: '1px solid #2c7be5',
    color: '#2c7be5', borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  logoutBtn: {
    padding: '7px 14px', background: '#fff', border: '1px solid #ddd',
    borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  container: { padding: '24px 32px', maxWidth: 900, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addBtn: {
    padding: '10px 18px', background: '#2c7be5', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
  },
  formBox: { background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #eee', marginBottom: 24 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box',
  },
  error: { color: '#e53e3e', fontSize: 13, marginTop: 8 },
  success: { color: '#22c55e', fontSize: 13, marginTop: 8 },
  successBanner: {
    background: '#f0fff4', color: '#22c55e', border: '1px solid #86efac',
    padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14,
  },
  filterTabs: { display: 'flex', gap: 8, marginBottom: 16 },
  filterTab: {
    padding: '7px 16px', background: '#fff', border: '1px solid #ddd',
    borderRadius: 20, cursor: 'pointer', fontSize: 13, color: '#555',
  },
  filterTabActive: { background: '#2c7be5', color: '#fff', border: '1px solid #2c7be5' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 },
  statCard: { padding: '16px 20px', borderRadius: 8, textAlign: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', margin: 0 },
  statLabel: { fontSize: 13, margin: '4px 0 0 0', fontWeight: '500' },
  requestCard: {
    background: '#fff', padding: 20, borderRadius: 8,
    border: '1px solid #eee', marginBottom: 12,
  },
  requestTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  requestInfo: {},
  requestName: { fontWeight: 'bold', fontSize: 15, color: '#222', margin: 0 },
  requestSub: { color: '#888', fontSize: 13, margin: '2px 0 0 0' },
  requestRight: {},
  statusBadge: {
    padding: '4px 12px', borderRadius: 12, fontSize: 12,
    fontWeight: 'bold', display: 'inline-block',
  },
  requestPatient: { color: '#444', fontSize: 14, margin: '6px 0' },
  requestReason: { color: '#666', fontSize: 13, margin: '6px 0', fontStyle: 'italic' },
  requestFooter: { display: 'flex', gap: 16, marginTop: 10 },
  requestDate: { color: '#aaa', fontSize: 12 },
  actionRow: { display: 'flex', gap: 10, marginTop: 14 },
  approveBtn: {
    padding: '8px 20px', background: '#22c55e', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
  },
  rejectBtn: {
    padding: '8px 20px', background: '#fff', color: '#e53e3e',
    border: '1px solid #e53e3e', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
  },
};