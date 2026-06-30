import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const fetchPatient = async () => {
    try {
      const { data } = await API.get(`/patients/${id}`);
      setPatient(data);
      setForm(data);
    } catch (err) {
      setError('Patient not found.');
    }
  };

  useEffect(() => {
    fetchPatient();
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
        <button onClick={() => navigate('/patients')} style={styles.backBtn}>← Back to Patients</button>
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={{ margin: 0 }}>{patient.name}</h2>
          <button onClick={() => setIsEditing(!isEditing)} style={styles.editBtn}>
            {isEditing ? 'Cancel' : 'Edit Patient'}
          </button>
        </div>

        {!isEditing ? (
          <div style={styles.detailCard}>
            <DetailRow label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'} />
            <DetailRow label="Gender" value={patient.gender || '-'} />
            <DetailRow label="Contact" value={patient.contact || '-'} />
            <DetailRow label="Blood Group" value={patient.blood_group || '-'} />
            <DetailRow label="Emergency Contact" value={patient.emergency_contact || '-'} />
            <DetailRow label="Address" value={patient.address || '-'} />
            <DetailRow label="Patient Added On" value={new Date(patient.created_at).toLocaleString()} />
          </div>
        ) : (
          <form onSubmit={handleSave} style={styles.detailCard}>
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

        {/* Placeholder sections for future days */}
        <div style={styles.sectionPlaceholder}>
          <h3>Rare Diseases</h3>
          <p style={{ color: '#999' }}>Coming Day 4 — link this patient to a rare disease</p>
        </div>

        <div style={styles.sectionPlaceholder}>
          <h3>Medical Records</h3>
          <p style={{ color: '#999' }}>Coming Day 5 — diagnosis, prescriptions, treatment notes, visit history</p>
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e5e5e5',
  },
  logo: { color: '#2c7be5', margin: 0, fontSize: 22 },
  backBtn: {
    padding: '8px 16px', background: '#fff', border: '1px solid #ddd',
    borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  container: { padding: '24px 32px', maxWidth: 800, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  editBtn: {
    padding: '8px 18px', background: '#2c7be5', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
  },
  detailCard: { background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #eee', marginBottom: 20 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  rowLabel: { color: '#888', fontSize: 14 },
  rowValue: { color: '#222', fontSize: 14, fontWeight: '500' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 },
  input: { padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  saveBtn: {
    padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
  },
  sectionPlaceholder: {
    background: '#fff', padding: 20, borderRadius: 8, border: '1px dashed #ddd', marginBottom: 16,
  },
};