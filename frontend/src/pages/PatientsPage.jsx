import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', dob: '', gender: 'Male', contact: '',
    address: '', blood_group: '', emergency_contact: ''
  });

  const { user, logout } = useAuth();
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
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300); // debounce search
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert('Failed to delete patient.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <h1 style={styles.logo}>RareSync</h1>
        <div style={styles.topRight}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={{ margin: 0 }}>Patients</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Patient'}
          </button>
        </div>

        <input
          placeholder="Search by name or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        {/* Add Patient Form */}
        {showForm && (
          <form onSubmit={handleAdd} style={styles.formBox}>
            <div style={styles.formGrid}>
              <input style={styles.input} name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} required />
              <input style={styles.input} name="dob" type="date" placeholder="Date of Birth" value={form.dob} onChange={handleChange} />
              <select style={styles.input} name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input style={styles.input} name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} />
              <input style={styles.input} name="blood_group" placeholder="Blood Group (e.g. O+)" value={form.blood_group} onChange={handleChange} />
              <input style={styles.input} name="emergency_contact" placeholder="Emergency Contact" value={form.emergency_contact} onChange={handleChange} />
              <input style={{ ...styles.input, gridColumn: '1 / -1' }} name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.saveBtn}>Save Patient</button>
          </form>
        )}

        {/* Patients Table */}
        {loading ? (
          <p style={{ color: '#888' }}>Loading patients...</p>
        ) : patients.length === 0 ? (
          <p style={{ color: '#888' }}>No patients found. Add your first patient above.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Gender</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Blood Group</th>
                <th style={styles.th}>Added On</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.gender || '-'}</td>
                  <td style={styles.td}>{p.contact || '-'}</td>
                  <td style={styles.td}>{p.blood_group || '-'}</td>
                  <td style={styles.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => navigate(`/patients/${p.id}`)} style={styles.viewBtn}>View</button>
                    <button onClick={() => handleDelete(p.id, p.name)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  topRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userName: { color: '#444', fontSize: 14 },
  logoutBtn: {
    padding: '8px 16px', background: '#fff', border: '1px solid #ddd',
    borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  container: { padding: '24px 32px', maxWidth: 1100, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: {
    padding: '10px 18px', background: '#2c7be5', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
  },
  searchInput: {
    width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd',
    marginBottom: 20, fontSize: 14, boxSizing: 'border-box',
  },
  formBox: { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 24, border: '1px solid #eee' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 },
  input: {
    padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box',
  },
  error: { color: '#e53e3e', fontSize: 13, marginBottom: 10 },
  saveBtn: {
    padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
  },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' },
  tableHeadRow: { background: '#f0f4ff' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 13, color: '#444', borderBottom: '2px solid #e5e5e5' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '12px 16px', fontSize: 14, color: '#333' },
  viewBtn: {
    padding: '6px 14px', background: '#2c7be5', color: '#fff', border: 'none',
    borderRadius: 5, cursor: 'pointer', fontSize: 12, marginRight: 8,
  },
  deleteBtn: {
    padding: '6px 14px', background: '#fff', color: '#e53e3e', border: '1px solid #e53e3e',