import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  // Disease states
  const [patientDiseases, setPatientDiseases] = useState([]);
  const [allDiseases, setAllDiseases] = useState([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState({ disease_id: '', notes: '' });
  const [linkError, setLinkError] = useState('');

  const fetchPatient = async () => {
    try {
      const { data } = await API.get(`/patients/${id}`);
      setPatient(data);
      setForm(data);
    } catch (err) {
      setError('Patient not found.');
    }
  };

  const fetchPatientDiseases = async () => {
    try {
      const { data } = await API.get(`/diseases/patient/${id}`);
      setPatientDiseases(data);
    } catch (err) {
      console.error('Could not load patient diseases');
    }
  };

  const fetchAllDiseases = async () => {
    try {
      const { data } = await API.get('/diseases');
      setAllDiseases(data);
    } catch (err) {
      console.error('Could not load diseases list');
    }
  };

  useEffect(() => {
    fetchPatient();
    fetchPatientDiseases();
    fetchAllDiseases();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/patients/${id}`, form);
      setIsEditing(false);
      fetchPatient();
    } catch (err) {
      setError('Failed to update patient.');
    }
  };

  const handleLinkDisease = async (e) => {
    e.preventDefault();
    setLinkError('');
    try {
      await API.post('/diseases/link/patient', {
        patient_id: parseInt(id),
        disease_id: parseInt(linkForm.disease_id),
        notes: linkForm.notes,
      });
      setShowLinkForm(false);
      setLinkForm({ disease_id: '', notes: '' });
      fetchPatientDiseases();
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Failed to link disease.');
    }
  };

  const handleUnlink = async (linkId, diseaseName) => {
    if (!window.confirm(`Remove "${diseaseName}" from this patient?`)) return;
    try {
      await API.delete(`/diseases/link/${linkId}`);
      fetchPatientDiseases();
    } catch (err) {
      alert('Failed to unlink disease.');
    }
  };

  if (error) {
    return (
      <div style={{ padding: 32, fontFamily: 'Arial' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/patients')}>Back to Patients</button>
      </div>
    );
  }

  if (!patient) {
    return <div style={{ padding: 32, fontFamily: 'Arial' }}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <h1 style={styles.logo}>RareSync</h1>
        <div style={styles.topRight}>
          <button onClick={() => navigate('/patients')} style={styles.backBtn}>← Patients</button>
          <button onClick={() => navigate('/diseases')} style={styles.navBtn}>Diseases</button>
        </div>
      </div>

      <div style={styles.container}>

        {/* Patient Header */}
        <div style={styles.headerRow}>
          <h2 style={{ margin: 0 }}>{patient.name}</h2>
          <button onClick={() => setIsEditing(!isEditing)} style={styles.editBtn}>
            {isEditing ? 'Cancel' : 'Edit Patient'}
          </button>
        </div>

        {/* Patient Info */}
        {!isEditing ? (
          <div style={styles.card}>
            <DetailRow label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'} />
            <DetailRow label="Gender" value={patient.gender || '-'} />
            <DetailRow label="Contact" value={patient.contact || '-'} />
            <DetailRow label="Blood Group" value={patient.blood_group || '-'} />
            <DetailRow label="Emergency Contact" value={patient.emergency_contact || '-'} />
            <DetailRow label="Address" value={patient.address || '-'} />
            <DetailRow label="Added On" value={new Date(patient.created_at).toLocaleString()} />
          </div>
        ) : (
          <form onSubmit={handleSave} style={styles.card}>
            <div style={styles.formGrid}>
              <input style={styles.input} name="name" value={form.name || ''} onChange={handleChange} placeholder="Name" required />
              <input style={styles.input} name="dob" type="date" value={form.dob ? form.dob.split('T')[0] : ''} onChange={handleChange} />
              <select style={styles.input} name="gender" value={form.gender || 'Male'} onChange={handleChange}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input style={styles.input} name="contact" value={form.contact || ''} onChange={handleChange} placeholder="Contact" />
              <input style={styles.input} name="blood_group" value={form.blood_group || ''} onChange={handleChange} placeholder="Blood Group" />
              <input style={styles.input} name="emergency_contact" value={form.emergency_contact || ''} onChange={handleChange} placeholder="Emergency Contact" />
              <input style={{ ...styles.input, gridColumn: '1 / -1' }} name="address" value={form.address || ''} onChange={handleChange} placeholder="Address" />
            </div>
            <button type="submit" style={styles.saveBtn}>Save Changes</button>
          </form>
        )}

        {/* Rare Diseases Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={{ margin: 0 }}>Rare Diseases</h3>
            {user?.role === 'doctor' && (
              <button onClick={() => setShowLinkForm(!showLinkForm)} style={styles.addBtn}>
                {showLinkForm ? 'Cancel' : '+ Link Disease'}
              </button>
            )}
          </div>

          {/* Link Disease Form — doctors only */}
          {showLinkForm && user?.role === 'doctor' && (
            <form onSubmit={handleLinkDisease} style={styles.linkForm}>
              <select
                style={styles.input}
                value={linkForm.disease_id}
                onChange={(e) => setLinkForm({ ...linkForm, disease_id: e.target.value })}
                required
              >
                <option value="">-- Select Rare Disease --</option>
                {allDiseases.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.icd_code ? `(${d.icd_code})` : ''}
                  </option>
                ))}
              </select>
              <textarea
                style={{ ...styles.input, marginTop: 10, resize: 'vertical', fontFamily: 'Arial' }}
                placeholder="Diagnosis notes (optional)"
                value={linkForm.notes}
                onChange={(e) => setLinkForm({ ...linkForm, notes: e.target.value })}
                rows={2}
              />
              {linkError && <p style={styles.error}>{linkError}</p>}
              <button type="submit" style={styles.saveBtn}>Link Disease</button>
            </form>
          )}

          {/* Linked Diseases List */}
          {patientDiseases.length === 0 ? (
            <p style={{ color: '#999', fontSize: 14 }}>No rare diseases linked to this patient yet.</p>
          ) : (
            patientDiseases.map((pd) => (
              <div key={pd.id} style={styles.diseaseItem}>
                <div style={styles.diseaseItemLeft}>
                  <p style={styles.diseaseItemName}>{pd.disease_name}</p>
                  {pd.icd_code && <span style={styles.icdBadge}>ICD: {pd.icd_code}</span>}
                  <p style={styles.diseaseItemMeta}>
                    Diagnosed by Dr. {pd.doctor_name} on {new Date(pd.diagnosed_at).toLocaleDateString()}
                  </p>
                  {pd.notes && <p style={styles.diseaseItemNotes}>Notes: {pd.notes}</p>}
                </div>
                {user?.role === 'doctor' && (
                  <button onClick={() => handleUnlink(pd.id, pd.disease_name)} style={styles.unlinkBtn}>
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Medical Records placeholder */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={{ margin: 0 }}>Medical Records</h3>
          </div>
          <p style={{ color: '#999', fontSize: 14 }}>Coming Day 5 — diagnosis, prescriptions, treatment notes, visit history</p>
        </div>

      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: '#fff',
    borderBottom: '1px solid #e5e5e5',
  },
  logo: { color: '#2c7be5', margin: 0, fontSize: 22 },
  topRight: { display: 'flex', gap: 12 },
  backBtn: {
    padding: '8px 16px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  navBtn: {
    padding: '8px 16px',
    background: '#f0f4ff',
    border: '1px solid #2c7be5',
    color: '#2c7be5',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  container: { padding: '24px 32px', maxWidth: 860, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  editBtn: {
    padding: '8px 18px',
    background: '#2c7be5',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 'bold',
  },
  card: { background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #eee', marginBottom: 20 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  rowLabel: { color: '#888', fontSize: 14 },
  rowValue: { color: '#222', fontSize: 14, fontWeight: '500' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  input: {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    boxSizing: 'border-box',
    width: '100%',
  },
  saveBtn: {
    padding: '10px 20px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  section: {
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #eee',
    marginBottom: 20,
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: {
    padding: '8px 16px',
    background: '#2c7be5',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 'bold',
  },
  linkForm: { background: '#f7f9fc', padding: 16, borderRadius: 8, marginBottom: 16 },
  error: { color: '#e53e3e', fontSize: 13, marginTop: 8 },
  diseaseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  diseaseItemLeft: { flex: 1 },
  diseaseItemName: { fontWeight: 'bold', fontSize: 15, color: '#222', margin: '0 0 4px 0' },
  diseaseItemMeta: { color: '#888', fontSize: 12, margin: '4px 0' },
  diseaseItemNotes: { color: '#555', fontSize: 13, margin: '4px 0', fontStyle: 'italic' },
  icdBadge: {
    display: 'inline-block',
    background: '#e8f0fe',
    color: '#2c7be5',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
  },
  unlinkBtn: {
    padding: '6px 14px',
    background: '#fff',
    color: '#e53e3e',
    border: '1px solid #e53e3e',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 12,
    marginLeft: 12,
    flexShrink: 0,
  },
};