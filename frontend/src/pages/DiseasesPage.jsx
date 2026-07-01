import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', symptoms: '',
    treatment_overview: '', icd_code: ''
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/diseases?search=${search}`);
      setDiseases(data);
    } catch (err) {
      setError('Failed to load diseases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchDiseases(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/diseases', form);
      setShowForm(false);
      setForm({ name: '', description: '', symptoms: '', treatment_overview: '', icd_code: '' });
      fetchDiseases();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add disease.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <h1 style={styles.logo}>RareSync</h1>
        <div style={styles.topRight}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={() => navigate('/patients')} style={styles.navBtn}>Patients</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={{ margin: 0 }}>Rare Diseases</h2>
          <button onClick={() => { setShowForm(!showForm); setSelectedDisease(null); }} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Disease'}
          </button>
        </div>

        <input
          placeholder="Search by disease name or ICD code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        {/* Add Disease Form */}
        {showForm && (
          <form onSubmit={handleAdd} style={styles.formBox}>
            <h3 style={{ marginTop: 0 }}>Add New Rare Disease</h3>
            <div style={styles.formGrid}>
              <input
                style={styles.input}
                name="name"
                placeholder="Disease Name *"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                style={styles.input}
                name="icd_code"
                placeholder="ICD Code (e.g. E75.22)"
                value={form.icd_code}
                onChange={handleChange}
              />
            </div>
            <textarea
              style={styles.textarea}
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
            <textarea
              style={styles.textarea}
              name="symptoms"
              placeholder="Symptoms (comma separated)"
              value={form.symptoms}
              onChange={handleChange}
              rows={2}
            />
            <textarea
              style={styles.textarea}
              name="treatment_overview"
              placeholder="Treatment Overview"
              value={form.treatment_overview}
              onChange={handleChange}
              rows={2}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.saveBtn}>Save Disease</button>
          </form>
        )}

        {/* Disease Detail Panel */}
        {selectedDisease && !showForm && (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedDisease.name}</h3>
                {selectedDisease.icd_code && (
                  <span style={styles.icdBadge}>ICD: {selectedDisease.icd_code}</span>
                )}
              </div>
              <button onClick={() => setSelectedDisease(null)} style={styles.closeBtn}>✕ Close</button>
            </div>
            {selectedDisease.description && (
              <div style={styles.detailSection}>
                <p style={styles.detailLabel}>Description</p>
                <p style={styles.detailValue}>{selectedDisease.description}</p>
              </div>
            )}
            {selectedDisease.symptoms && (
              <div style={styles.detailSection}>
                <p style={styles.detailLabel}>Symptoms</p>
                <p style={styles.detailValue}>{selectedDisease.symptoms}</p>
              </div>
            )}
            {selectedDisease.treatment_overview && (
              <div style={styles.detailSection}>
                <p style={styles.detailLabel}>Treatment Overview</p>
                <p style={styles.detailValue}>{selectedDisease.treatment_overview}</p>
              </div>
            )}
          </div>
        )}

        {/* Diseases List */}
        {loading ? (
          <p style={{ color: '#888' }}>Loading diseases...</p>
        ) : diseases.length === 0 ? (
          <p style={{ color: '#888' }}>No diseases found. Add your first rare disease above.</p>
        ) : (
          <div style={styles.diseaseGrid}>
            {diseases.map((d) => (
              <div
                key={d.id}
                style={{
                  ...styles.diseaseCard,
                  border: selectedDisease?.id === d.id ? '2px solid #2c7be5' : '1px solid #eee'
                }}
              >
                <div style={styles.cardTop}>
                  <div>
                    <p style={styles.diseaseName}>{d.name}</p>
                    {d.icd_code && (
                      <span style={styles.icdBadge}>ICD: {d.icd_code}</span>
                    )}
                  </div>
                </div>
                {d.description && (
                  <p style={styles.diseaseDesc}>
                    {d.description.length > 100
                      ? d.description.substring(0, 100) + '...'
                      : d.description}
                  </p>
                )}
                <button
                  onClick={() => setSelectedDisease(selectedDisease?.id === d.id ? null : d)}
                  style={styles.viewBtn}
                >
                  {selectedDisease?.id === d.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
  topRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userName: { color: '#444', fontSize: 14 },
  navBtn: {
    padding: '8px 16px',
    background: '#f0f4ff',
    border: '1px solid #2c7be5',
    color: '#2c7be5',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  container: { padding: '24px 32px', maxWidth: 1100, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: {
    padding: '10px 18px',
    background: '#2c7be5',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 6,
    border: '1px solid #ddd',
    marginBottom: 20,
    fontSize: 14,
    boxSizing: 'border-box',
  },
  formBox: {
    background: '#fff',
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    border: '1px solid #eee',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  input: {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    boxSizing: 'border-box',
    width: '100%',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    boxSizing: 'border-box',
    marginBottom: 12,
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif',
  },
  error: { color: '#e53e3e', fontSize: 13, marginBottom: 10 },
  saveBtn: {
    padding: '10px 20px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailPanel: {
    background: '#fff',
    padding: 24,
    borderRadius: 8,
    border: '2px solid #2c7be5',
    marginBottom: 24,
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  closeBtn: {
    padding: '6px 14px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  detailSection: { marginBottom: 12 },
  detailLabel: { color: '#888', fontSize: 12, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: 1 },
  detailValue: { color: '#333', fontSize: 14, margin: 0, lineHeight: 1.6 },
  icdBadge: {
    display: 'inline-block',
    background: '#e8f0fe',
    color: '#2c7be5',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    marginTop: 4,
  },
  diseaseGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  diseaseCard: {
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    cursor: 'default',
    transition: 'box-shadow 0.2s',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  diseaseName: { fontWeight: 'bold', fontSize: 15, color: '#222', margin: 0 },
  diseaseDesc: { color: '#666', fontSize: 13, lineHeight: 1.5, marginBottom: 12 },
  viewBtn: {
    padding: '6px 14px',
    background: '#f0f4ff',
    color: '#2c7be5',
    border: '1px solid #2c7be5',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 'bold',
  },
};