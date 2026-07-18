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
      await API.post('/access/request', { patient_id: patientId, reason: 'Requesting access to view patient records.' });
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
    if (filter === 'approved') return p.access_status === 'approved';
    if (filter === 'pending') return p.access_status === 'pending';
    if (filter === 'limited') return p.access_status === 'none';
    return true;
  });

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.pageTitle}>
              {user?.role === 'doctor' ? 'All Patients' : 'My Hospital Patients'}
            </h2>
            <p style={styles.pageSubtitle}>
              {user?.role === 'doctor'
                ? 'Browse patients across all hospitals — request access to view full records'
                : 'Manage patients in your hospital'}
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Patient'}
          </button>
        </div>

        {/* Add Patient Form */}
        {showForm && (
          <form onSubmit={handleAdd} style={styles.formBox}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)' }}>Add New Patient</h3>
            <div style={styles.formGrid}>
              <input style={styles.input} name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} required />
              <input style={styles.input} name="dob" type="date" placeholder="Date of Birth" value={form.dob} onChange={handleChange} />
              <select style={styles.input} name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input style={styles.input} name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} />
              <input style={styles.input} name="blood_group" placeholder="Blood Group (e.g. O+)" value={form.blood_group} onChange={handleChange} />
              <input style={styles.input} name="emergency_contact" placeholder="Emergency Contact" value={form.emergency_contact} onChange={handleChange} />
              <input style={{ ...styles.input, gridColumn: '1/-1' }} name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.saveBtn}>Save Patient</button>
          </form>
        )}

        {/* Search + Filter */}
        <div style={styles.searchRow}>
          <input
            placeholder={user?.role === 'doctor' ? 'Search by patient name or hospital...' : 'Search by name or contact...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {user?.role === 'doctor' && (
            <div style={styles.filterTabs}>
              {[
                { key: 'all', label: 'All' },
                { key: 'approved', label: 'Access Approved' },
                { key: 'pending', label: 'Pending' },
                { key: 'limited', label: 'No Access' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{ ...styles.filterTab, ...(filter === f.key ? styles.filterTabActive : {}) }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats row for doctors */}
        {user?.role === 'doctor' && (
          <div style={styles.statsRow}>
            <StatPill label="Total" value={patients.length} color="var(--accent)" bg="var(--bg4)" />
            <StatPill label="Full Access" value={patients.filter(p => p.access_status === 'approved').length} color="var(--green)" bg="var(--gbg)" />
            <StatPill label="Pending" value={patients.filter(p => p.access_status === 'pending').length} color="var(--orange)" bg="var(--obg)" />
            <StatPill label="No Access" value={patients.filter(p => p.access_status === 'none').length} color="var(--text3)" bg="var(--bg3)" />
          </div>
        )}

        {/* Patient Cards */}
        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading patients...</p>
        ) : filteredPatients.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>No patients found.</p>
        ) : (
          <div style={styles.cardGrid}>
            {filteredPatients.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                userRole={user?.role}
                requestingId={requestingId}
                onView={() => navigate(`/patients/${p.id}`)}
                onRequestAccess={(e) => handleRequestAccess(p.id, e)}
                onDelete={(e) => handleDelete(p.id, p.name, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientCard({ patient, userRole, requestingId, onView, onRequestAccess, onDelete }) {
  const isRequesting = requestingId === patient.id;
const accessConfig = {
  assigned: { label: 'Your Patient', color: 'var(--accent)', bg: 'var(--bg4)', border: 'var(--border2)' },
  approved: { label: 'Access Approved', color: 'var(--green)', bg: 'var(--gbg)', border: 'var(--gborder)' },
  pending:  { label: 'Pending Approval', color: 'var(--orange)', bg: 'var(--obg)', border: 'var(--oborder)' },
  none:     { label: 'No Access', color: 'var(--text3)', bg: 'var(--bg3)', border: 'var(--border2)' },
};

  const ac = accessConfig[patient.access_status] || accessConfig.none;

  return (
    <div
      style={{
        ...styles.patientCard,
        cursor: patient.access_status === 'approved' ? 'pointer' : 'default',
        borderTop: `3px solid ${patient.access_status === 'approved' ? 'var(--green)' : patient.access_status === 'pending' ? 'var(--orange)' : 'var(--border)'}`,
      }}
      onClick={patient.access_status === 'approved' || userRole === 'hospital' ? onView : undefined}
    >
      {/* Card Header */}
      <div style={styles.cardHeader}>
        <div style={styles.cardAvatar}>
          {patient.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={styles.cardName}>{patient.name}</p>
          {userRole === 'doctor' && (
            <p style={styles.cardHospital}>{patient.hospital_name}</p>
          )}
        </div>
        {userRole === 'doctor' && (
          <span style={{ ...styles.accessBadge, background: ac.bg, color: ac.color, border: `1px solid ${ac.border}` }}>
            {ac.label}
          </span>
        )}
      </div>

      {/* Basic Info — always visible */}
      <div style={styles.cardInfo}>
        <InfoPill label="Age" value={patient.age ? `${patient.age} yrs` : '-'} />
        <InfoPill label="Gender" value={patient.gender || '-'} />
        {patient.blood_group && <InfoPill label="Blood" value={patient.blood_group} />}
      </div>

      {/* Disease names — always visible */}
      {patient.disease_names && (
        <div style={styles.diseasePill}>
          <span style={styles.diseaseIcon}>🧬</span>
          <span style={styles.diseaseName}>{patient.disease_names}</span>
        </div>
      )}

      {/* Actions */}
      <div style={styles.cardActions}>
        {userRole === 'hospital' && (
          <>
            <button onClick={onView} style={styles.viewBtn}>View Full Record</button>
            <button onClick={onDelete} style={styles.deleteBtn}>Delete</button>
          </>
        )}

        {userRole === 'doctor' && (
          <>
            {patient.access_status === 'approved' && (
              <button onClick={onView} style={styles.viewBtn}>View Full Record</button>
            )}
            {patient.access_status === 'pending' && (
              <button style={styles.pendingBtn} disabled>⏳ Pending Approval</button>
            )}
            {patient.access_status === 'none' && (
              <button
                onClick={onRequestAccess}
                style={styles.requestBtn}
                disabled={isRequesting}
              >
                {isRequesting ? 'Submitting...' : '🔐 Request Access'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div style={styles.infoPill}>
      <span style={styles.infoPillLabel}>{label}</span>
      <span style={styles.infoPillValue}>{value}</span>
    </div>
  );
}

function StatPill({ label, value, color, bg }) {
  return (
    <div style={{ ...styles.statPill, background: bg }}>
      <span style={{ ...styles.statPillNum, color }}>{value}</span>
      <span style={{ ...styles.statPillLabel, color }}>{label}</span>
    </div>
  );
}

const styles = {
  page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  container: { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 },
  pageSubtitle: { fontSize: 13, color: 'var(--text2)', margin: '4px 0 0 0' },
  addBtn: {
    padding: '10px 18px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  },
  formBox: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border2)', fontSize: 14, boxSizing: 'border-box', width: '100%', background: 'var(--bg3)', color: 'var(--text)' },
  error: { color: 'var(--red)', fontSize: 13, marginBottom: 8 },
  saveBtn: { padding: '10px 20px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 },

  searchRow: { marginBottom: 16 },
  searchInput: { width: '100%', padding: '11px 16px', borderRadius: 10, border: '1px solid var(--border2)', fontSize: 14, background: 'var(--bg2)', color: 'var(--text)', boxSizing: 'border-box', marginBottom: 10 },
  filterTabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterTab: { padding: '6px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 20, cursor: 'pointer', fontSize: 12, color: 'var(--text2)', fontWeight: 600 },
  filterTabActive: { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },

  statsRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  statPill: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px', borderRadius: 10, minWidth: 80 },
  statPillNum: { fontSize: 22, fontWeight: 800 },
  statPillLabel: { fontSize: 11, fontWeight: 600, marginTop: 2 },

  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  patientCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, transition: 'box-shadow 0.2s' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  cardAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, flexShrink: 0 },
  cardName: { fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: 0 },
  cardHospital: { fontSize: 12, color: 'var(--text3)', margin: '2px 0 0 0' },
  accessBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' },

  cardInfo: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  infoPill: { display: 'flex', flexDirection: 'column', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', minWidth: 60 },
  infoPillLabel: { fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoPillValue: { fontSize: 13, color: 'var(--text)', fontWeight: 600, marginTop: 2 },

  diseasePill: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--pbg)', border: '1px solid var(--pborder)', borderRadius: 8, padding: '6px 12px', marginBottom: 14 },
  diseaseIcon: { fontSize: 14, flexShrink: 0 },
  diseaseName: { fontSize: 12, color: 'var(--purple)', fontWeight: 600, lineHeight: 1.4 },

  cardActions: { display: 'flex', gap: 8 },
  viewBtn: { flex: 1, padding: '8px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  requestBtn: { flex: 1, padding: '8px 0', background: 'var(--bg4)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  pendingBtn: { flex: 1, padding: '8px 0', background: 'var(--obg)', color: 'var(--orange)', border: '1px solid var(--oborder)', borderRadius: 8, cursor: 'not-allowed', fontSize: 13, fontWeight: 700 },
  deleteBtn: { padding: '8px 14px', background: 'var(--rbg)', color: 'var(--red)', border: '1px solid var(--rborder)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
};