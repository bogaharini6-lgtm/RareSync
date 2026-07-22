import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import MedicalRecordsTab from './MedicalRecordsTab';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [accessLevel, setAccessLevel] = useState('limited');
  const [accessRequest, setAccessRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const [patientDiseases, setPatientDiseases] = useState([]);
  const [allDiseases, setAllDiseases] = useState([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState({ disease_id: '', notes: '' });
  const [linkError, setLinkError] = useState('');

  const [requestReason, setRequestReason] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  const fetchPatient = async () => {
    try {
      const { data } = await API.get(`/patients/${id}`);
      setPatient(data);
      setAccessLevel(data.access_level || 'full');
      setForm(data);
    } catch (err) {
      setError('Patient not found or access denied.');
    }
  };

  const fetchMyAccessRequest = async () => {
    if (user?.role !== 'doctor') return;
    try {
      const { data } = await API.get('/access/my-requests');
      const req = data.find((r) => r.patient_id === parseInt(id));
      setAccessRequest(req || null);
    } catch (err) {
      console.error('Could not load access requests');
    }
  };

  const fetchPatientDiseases = async () => {
    try {
      const { data } = await API.get(`/diseases/patient/${id}`);
      setPatientDiseases(data);
    } catch (err) {
      console.error('Could not load diseases');
    }
  };

  const fetchAllDiseases = async () => {
    try {
      const { data } = await API.get('/diseases');
      setAllDiseases(data);
    } catch (err) {
      console.error('Could not load disease list');
    }
  };

  useEffect(() => {
    fetchPatient();
    fetchMyAccessRequest();
  }, [id]);

  useEffect(() => {
    if (accessLevel === 'full') {
      fetchPatientDiseases();
      fetchAllDiseases();
    }
  }, [accessLevel]);

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError('');
    setRequestSuccess('');
    try {
      await API.post('/access/request', {
        patient_id: parseInt(id),
        reason: requestReason,
      });
      setRequestSuccess('Access request submitted. Waiting for hospital approval.');
      setRequestReason('');
      fetchMyAccessRequest();
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  if (error) return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ padding: 32 }}>
        <p style={{ color: 'var(--red)' }}>{error}</p>
        <button onClick={() => navigate('/patients')} style={styles.backBtn}>Back to Patients</button>
      </div>
    </div>
  );

  if (!patient) return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ padding: 32, color: 'var(--text2)' }}>Loading...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* Patient Header */}
        <div style={styles.headerRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={styles.avatar}>{patient.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h2 style={styles.patientName}>{patient.name}</h2>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{
                  ...styles.badge,
                  background: accessLevel === 'full' ? 'var(--gbg)' : 'var(--obg)',
                  color: accessLevel === 'full' ? 'var(--green)' : 'var(--orange)',
                  border: `1px solid ${accessLevel === 'full' ? 'var(--gborder)' : 'var(--oborder)'}`,
                }}>
                  {accessLevel === 'full' ? 'Full access' : 'Limited access'}
                </span>
                {patient.gender && (
                  <span style={{ ...styles.badge, background: 'var(--bg4)', color: 'var(--accent)', border: '1px solid var(--border2)' }}>
                    {patient.gender}
                  </span>
                )}
                {patient.blood_group && (
                  <span style={{ ...styles.badge, background: 'var(--rbg)', color: 'var(--red)', border: '1px solid var(--rborder)' }}>
                    {patient.blood_group}
                  </span>
                )}
              </div>
            </div>
          </div>
          {accessLevel === 'full' && (
            <button onClick={() => setIsEditing(!isEditing)} style={styles.editBtn}>
              {isEditing ? 'Cancel' : 'Edit Patient'}
            </button>
          )}
        </div>

        {/* LIMITED ACCESS BANNER */}
        {accessLevel === 'limited' && user?.role === 'doctor' && (
          <div style={styles.limitedBanner}>
            <div style={styles.limitedIcon}>🔒</div>
            <div style={{ flex: 1 }}>
              <p style={styles.limitedTitle}>Limited access</p>
              <p style={styles.limitedDesc}>
                You can only see basic patient information. Request access from the hospital to view full details including medical records, diagnoses, and prescriptions.
              </p>
            </div>

            {/* Show request status if already requested */}
            {accessRequest ? (
              <div style={{
                ...styles.statusBox,
                background: accessRequest.status === 'Pending' ? 'var(--obg)' : 'var(--rbg)',
                border: `1px solid ${accessRequest.status === 'Pending' ? 'var(--oborder)' : 'var(--rborder)'}`,
                color: accessRequest.status === 'Pending' ? 'var(--orange)' : 'var(--red)',
              }}>
                <strong>{accessRequest.status}</strong>
                <p style={{ fontSize: 11, margin: '2px 0 0 0' }}>
                  {accessRequest.status === 'Pending'
                    ? 'Waiting for hospital approval'
                    : 'Request was rejected. You can try again.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} style={styles.requestForm}>
                <textarea
                  style={styles.requestInput}
                  placeholder="Reason for access (optional)"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  rows={2}
                />
                {requestError && <p style={{ color: 'var(--red)', fontSize: 12 }}>{requestError}</p>}
                {requestSuccess && <p style={{ color: 'var(--green)', fontSize: 12 }}>{requestSuccess}</p>}
                <button type="submit" style={styles.requestBtn} disabled={requestLoading}>
                  {requestLoading ? 'Submitting...' : 'Request Access'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* FULL PATIENT DETAILS */}
        {accessLevel === 'full' && (
          <>
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
                  <input style={{ ...styles.input, gridColumn: '1/-1' }} name="address" value={form.address || ''} onChange={handleChange} placeholder="Address" />
                </div>
                <button type="submit" style={styles.saveBtn}>Save Changes</button>
              </form>
            )}

            {/* RARE DISEASES */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Rare Diseases</h3>
                {user?.role === 'doctor' && (
                  <button onClick={() => setShowLinkForm(!showLinkForm)} style={styles.addBtn}>
                    {showLinkForm ? 'Cancel' : '+ Link Disease'}
                  </button>
                )}
              </div>

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
                  {linkError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 6 }}>{linkError}</p>}
                  <button type="submit" style={{ ...styles.saveBtn, marginTop: 10 }}>Link Disease</button>
                </form>
              )}

              {patientDiseases.length === 0 ? (
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>No rare diseases linked yet.</p>
              ) : (
                patientDiseases.map((pd) => (
                  <div key={pd.id} style={styles.diseaseItem}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.diseaseName}>{pd.disease_name}</p>
                      {pd.icd_code && <span style={styles.icdBadge}>ICD: {pd.icd_code}</span>}
                      <p style={styles.diseaseMeta}>
                        Diagnosed by Dr. {pd.doctor_name} on {new Date(pd.diagnosed_at).toLocaleDateString()}
                      </p>
                      {pd.notes && <p style={styles.diseaseNotes}>Notes: {pd.notes}</p>}
                    </div>
                    {user?.role === 'doctor' && (
                      <button onClick={() => handleUnlink(pd.id, pd.disease_name)} style={styles.unlinkBtn}>Remove</button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* MEDICAL RECORDS */}
            <div style={styles.section}>
              <MedicalRecordsTab 
  patientId={parseInt(id)} 
  patientDiseases={patientDiseases}
  accessLevel={accessLevel}
/>
            </div>
          </>
        )}

        {/* LIMITED VIEW — only show name */}
        {accessLevel === 'limited' && (
          <div style={styles.card}>
            <DetailRow label="Name" value={patient.name} />
            <DetailRow label="Access" value="Request access to see full details" />
          </div>
        )}

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
  page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  container: { padding: '24px 32px', maxWidth: 860, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 800, flexShrink: 0,
  },
  patientName: { fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  editBtn: {
    padding: '8px 18px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  },

  limitedBanner: {
    background: 'var(--obg)', border: '1px solid var(--oborder)',
    borderRadius: 12, padding: 20, marginBottom: 20,
    display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap',
  },
  limitedIcon: { fontSize: 28, flexShrink: 0 },
  limitedTitle: { fontWeight: 700, color: 'var(--orange)', fontSize: 15, margin: '0 0 4px 0' },
  limitedDesc: { color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, margin: 0 },
  statusBox: { padding: '12px 16px', borderRadius: 8, flexShrink: 0 },
  requestForm: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 },
  requestInput: {
    padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: 8, color: 'var(--text)', fontSize: 12, resize: 'vertical', fontFamily: 'Arial',
  },
  requestBtn: {
    padding: '8px 16px', background: 'var(--orange)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  },

  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  rowLabel: { color: 'var(--text3)', fontSize: 14 },
  rowValue: { color: 'var(--text)', fontSize: 14, fontWeight: 600 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  input: {
    padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border2)',
    fontSize: 14, boxSizing: 'border-box', width: '100%',
    background: 'var(--bg3)', color: 'var(--text)',
  },
  saveBtn: {
    padding: '10px 20px', background: 'var(--green)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700,
  },

  section: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 },
  addBtn: {
    padding: '7px 14px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  },
  linkForm: { background: 'var(--bg3)', padding: 16, borderRadius: 8, marginBottom: 16 },
  diseaseItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid var(--border)',
  },
  diseaseName: { fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: '0 0 4px 0' },
  diseaseMeta: { color: 'var(--text3)', fontSize: 12, margin: '4px 0' },
  diseaseNotes: { color: 'var(--text2)', fontSize: 13, fontStyle: 'italic', margin: '4px 0' },
  icdBadge: {
    display: 'inline-block', background: 'var(--bg4)', color: 'var(--accent)',
    padding: '2px 10px', borderRadius: 12, fontSize: 12,
  },
  unlinkBtn: {
    padding: '6px 12px', background: 'var(--rbg)', color: 'var(--red)',
    border: '1px solid var(--rborder)', borderRadius: 6, cursor: 'pointer', fontSize: 12,
  },
  backBtn: {
    padding: '8px 16px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 12,
  },
};