import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const PURPOSES = [
  'Second Opinion',
  'Treatment Planning',
  'Research',
  'Referral',
  'Follow-up Care',
  'Emergency',
  'Consultation',
];

const DURATIONS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
];

const INFO_OPTIONS = [
  'Medical History',
  'Diagnosis',
  'Reports / Lab Results',
  'Treatment History',
  'Prescriptions',
  'Visit History',
  'Doctor Notes',
];

const STATUS_STYLES = {
  Pending:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Approved: { bg: '#f0fff4', color: '#16a34a', border: '#bbf7d0' },
  Rejected: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

export default function AccessRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    patient_id: '',
    purpose: '',
    duration_days: 14,
    requested_info: [],
    reason: '',
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = user?.role === 'hospital'
        ? `/access/hospital${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
        : '/access/my-requests';
      const { data } = await API.get(url);
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await API.get('/patients');
      setPatients(data.filter(p => p.access_status === 'none' || p.access_status === 'pending'));
    } catch (err) {
      console.error('Could not load patients');
    }
  };

  useEffect(() => {
    fetchRequests();
    if (user?.role === 'doctor') fetchPatients();
  }, [statusFilter]);

  const toggleInfo = (info) => {
    setForm((prev) => ({
      ...prev,
      requested_info: prev.requested_info.includes(info)
        ? prev.requested_info.filter((i) => i !== info)
        : [...prev.requested_info, info],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.patient_id) return setFormError('Please select a patient.');
    if (!form.purpose) return setFormError('Please select a purpose.');
    if (form.requested_info.length === 0) return setFormError('Please select at least one type of information.');

    try {
      await API.post('/access/request', {
        patient_id: form.patient_id,
        purpose: form.purpose,
        duration_days: form.duration_days,
        requested_info: form.requested_info.join(', '),
        reason: form.reason,
      });
      setFormSuccess('Access request submitted successfully.');
      setShowForm(false);
      setForm({ patient_id: '', purpose: '', duration_days: 14, requested_info: [], reason: '' });
      fetchRequests();
      fetchPatients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit request.');
    }
  };

  const handleResolve = async (id, status) => {
    if (!window.confirm(`${status} this request?`)) return;
    try {
      await API.put(`/access/${id}/resolve`, { status });
      fetchRequests();
    } catch (err) {
      alert('Failed to update request.');
    }
  };

  const isExpired = (expires_at) => expires_at && new Date(expires_at) < new Date();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Access Requests</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0 0' }}>
              {user?.role === 'doctor' ? 'Request access to view patient records' : 'Review and manage access requests'}
            </p>
          </div>
          {user?.role === 'doctor' && (
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding: '10px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {showForm ? 'Cancel' : '+ Request Access'}
            </button>
          )}
        </div>

        {/* Success Banner */}
        {formSuccess && (
          <div style={{ background: 'var(--gbg)', border: '1px solid var(--gborder)', color: 'var(--green)', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
            ✓ {formSuccess}
          </div>
        )}

        {/* ── REQUEST ACCESS FORM ── */}
        {showForm && user?.role === 'doctor' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Request Patient Access
            </h3>
            <form onSubmit={handleSubmit}>

              {/* Patient Select */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Select Patient</label>
                <select style={inputStyle} value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
                  <option value="">-- Select a patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.hospital_name}</option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Purpose of Access</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {PURPOSES.map((p) => (
                    <button key={p} type="button"
                      onClick={() => setForm({ ...form, purpose: p })}
                      style={{
                        padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', border: '1.5px solid',
                        background: form.purpose === p ? 'var(--accent)' : 'var(--bg3)',
                        color: form.purpose === p ? '#fff' : 'var(--text2)',
                        borderColor: form.purpose === p ? 'var(--accent)' : 'var(--border2)',
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Access Duration</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {DURATIONS.map((d) => (
                    <button key={d.value} type="button"
                      onClick={() => setForm({ ...form, duration_days: d.value })}
                      style={{
                        padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', border: '1.5px solid',
                        background: form.duration_days === d.value ? 'var(--accent)' : 'var(--bg3)',
                        color: form.duration_days === d.value ? '#fff' : 'var(--text2)',
                        borderColor: form.duration_days === d.value ? 'var(--accent)' : 'var(--border2)',
                      }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requested Information */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Requested Information</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {INFO_OPTIONS.map((info) => (
                    <button key={info} type="button"
                      onClick={() => toggleInfo(info)}
                      style={{
                        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', border: '1.5px solid',
                        background: form.requested_info.includes(info) ? 'var(--gbg)' : 'var(--bg3)',
                        color: form.requested_info.includes(info) ? 'var(--green)' : 'var(--text2)',
                        borderColor: form.requested_info.includes(info) ? 'var(--gborder)' : 'var(--border2)',
                      }}>
                      {form.requested_info.includes(info) ? '✓ ' : ''}{info}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Additional Reason (optional)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'Arial', lineHeight: 1.6 }}
                  value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Provide any additional context for your request..." rows={3} />
              </div>

              {formError && <p style={{ color: 'var(--red)', fontSize: 13, margin: '0 0 12px 0' }}>{formError}</p>}

              <button type="submit"
                style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Hospital Stats */}
        {user?.role === 'hospital' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {['Pending', 'Approved', 'Rejected'].map((s) => {
              const count = requests.filter((r) => r.status === s).length;
              const st = STATUS_STYLES[s];
              return (
                <div key={s} style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: 10, padding: '14px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: st.color, margin: 0 }}>{count}</p>
                  <p style={{ fontSize: 12, color: st.color, margin: '4px 0 0 0', fontWeight: 600 }}>{s}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter Tabs — Hospital */}
        {user?.role === 'hospital' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {['all', 'Pending', 'Approved', 'Rejected'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border2)', background: statusFilter === s ? 'var(--accent)' : 'var(--bg2)', color: statusFilter === s ? '#fff' : 'var(--text2)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                {s === 'all' ? 'All Requests' : s}
              </button>
            ))}
          </div>
        )}

        {/* Requests List */}
        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0' }}>No access requests</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>
              {user?.role === 'doctor' ? 'Click "+ Request Access" to request patient access' : 'No requests received yet'}
            </p>
          </div>
        ) : (
          requests.map((r) => {
            const st = STATUS_STYLES[r.status] || STATUS_STYLES.Pending;
            const expired = isExpired(r.expires_at);

            return (
              <div key={r.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 12 }}>

                {/* Request Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                      {user?.role === 'hospital' ? r.doctor_name?.charAt(0).toUpperCase() : r.patient_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                        {user?.role === 'hospital' ? `Dr. ${r.doctor_name}` : r.patient_name}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text3)' }}>
                        {user?.role === 'hospital' ? r.specialization || 'General' : r.hospital_name}
                      </p>
                    </div>
                  </div>
                  <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: expired ? 'var(--rbg)' : st.bg, color: expired ? 'var(--red)' : st.color, border: `1px solid ${expired ? 'var(--rborder)' : st.border}` }}>
                    {expired ? 'Expired' : r.status}
                  </span>
                </div>

                {/* Patient name for hospital view */}
                {user?.role === 'hospital' && (
                  <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 12px 0' }}>
                    Requesting access to: <strong>{r.patient_name}</strong>
                  </p>
                )}

                {/* Purpose + Duration + Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Purpose</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{r.purpose || 'General'}</p>
                  </div>
                  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Duration</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{r.duration_days || 30} days</p>
                  </div>
                  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>
                      {r.status === 'Approved' ? 'Expires' : 'Requested'}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: expired ? 'var(--red)' : 'var(--text)', margin: 0 }}>
                      {r.status === 'Approved' && r.expires_at
                        ? new Date(r.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date(r.requested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Requested Info */}
                {r.requested_info && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px 0' }}>Requested Information</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {r.requested_info.split(', ').map((info) => (
                        <span key={info} style={{ padding: '3px 10px', background: 'var(--bg4)', color: 'var(--accent)', border: '1px solid var(--border2)', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          {info}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reason */}
                {r.reason && (
                  <p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                    "{r.reason}"
                  </p>
                )}

                {/* Approve / Reject buttons */}
                {user?.role === 'hospital' && r.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button onClick={() => handleResolve(r.id, 'Approved')}
                      style={{ padding: '9px 22px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleResolve(r.id, 'Rejected')}
                      style={{ padding: '9px 22px', background: 'var(--rbg)', color: 'var(--red)', border: '1px solid var(--rborder)', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      ✕ Reject
                    </button>
                  </div>
                )}

                {/* Approved access info for doctor */}
                {user?.role === 'doctor' && r.status === 'Approved' && !expired && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--gbg)', border: '1px solid var(--gborder)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, margin: 0 }}>
                      ✓ Access granted · Purpose: {r.purpose} · Expires: {r.expires_at ? new Date(r.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                )}

                {/* Expired notice */}
                {expired && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--rbg)', border: '1px solid var(--rborder)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, margin: 0 }}>
                      ✕ Access expired on {new Date(r.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
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

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)',
  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2,
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid var(--border2)', fontSize: 14,
  background: 'var(--bg3)', color: 'var(--text)', boxSizing: 'border-box',
};