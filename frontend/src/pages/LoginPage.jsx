import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('doctor');
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', phone: '', address: '', hospital_id: '' });
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setError('');
    setIsRegister(false);
    setForm({ name: '', email: '', password: '', specialization: '', phone: '', address: '', hospital_id: '' });
    if (tab === 'doctor') {
      const { data } = await API.get('/auth/hospitals');
      setHospitals(data);
    }
  };

  const handleRegisterToggle = async () => {
    setIsRegister(!isRegister);
    setError('');
    if (!isRegister && activeTab === 'doctor') {
      const { data } = await API.get('/auth/hospitals');
      setHospitals(data);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await API.post(`/auth/${activeTab}/register`, form);
        alert(`${activeTab === 'doctor' ? 'Doctor' : 'Hospital'} registered! Please login.`);
        setIsRegister(false);
        setForm({ name: '', email: '', password: '', specialization: '', phone: '', address: '', hospital_id: '' });
      } else {
        const { data } = await API.post(`/auth/${activeTab}/login`, { email: form.email, password: form.password });
        login(data);
        navigate(activeTab === 'doctor' ? '/doctor/dashboard' : '/hospital/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          Rare<span style={{ color: 'var(--accent2)' }}>Sync</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={toggleTheme} style={styles.themeBtn}>{isDark ? '☀️' : '🌑'}</button>
          <button onClick={() => navigate('/')} style={styles.backBtn}>← Home</button>
        </div>
      </div>

      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.cardLogo}>RareSync</div>
          <p style={styles.cardSub}>Rare Disease Management Platform</p>

          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'doctor' ? styles.tabActive : {}) }}
              onClick={() => handleTabChange('doctor')}
            >Doctor</button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'hospital' ? styles.tabActive : {}) }}
              onClick={() => handleTabChange('hospital')}
            >Hospital</button>
          </div>

          <h3 style={styles.formTitle}>
            {isRegister
              ? `Register as ${activeTab === 'doctor' ? 'Doctor' : 'Hospital'}`
              : `Login as ${activeTab === 'doctor' ? 'Doctor' : 'Hospital'}`}
          </h3>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <input style={styles.input} name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
            )}
            <input style={styles.input} name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
            <input style={styles.input} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />

            {isRegister && activeTab === 'doctor' && (
              <>
                <input style={styles.input} name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} />
                <input style={styles.input} name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
                <select style={styles.input} name="hospital_id" value={form.hospital_id} onChange={handleChange} required>
                  <option value="">-- Select Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </>
            )}

            {isRegister && activeTab === 'hospital' && (
              <>
                <input style={styles.input} name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
                <input style={styles.input} name="address" placeholder="Address" value={form.address} onChange={handleChange} />
              </>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Register' : `Login as ${activeTab === 'doctor' ? 'Doctor' : 'Hospital'}`}
            </button>
          </form>

          <p style={styles.toggleText}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span style={styles.toggleLink} onClick={handleRegisterToggle}>
              {isRegister ? 'Login' : 'Register'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 32px', background: 'var(--topbar)', borderBottom: '1px solid var(--border)',
  },
  logo: { fontSize: 18, fontWeight: 800, color: 'var(--accent)', cursor: 'pointer', letterSpacing: '-0.5px' },
  themeBtn: { background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 14 },
  backBtn: { padding: '6px 14px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontSize: 12, cursor: 'pointer' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 57px)', padding: 24 },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 420 },
  cardLogo: { textAlign: 'center', fontSize: 26, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 },
  cardSub: { textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginBottom: 24 },
  tabs: { display: 'flex', border: '1px solid var(--border2)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  tab: { flex: 1, padding: '10px 0', border: 'none', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  tabActive: { background: 'var(--accent)', color: '#fff' },
  formTitle: { textAlign: 'center', marginBottom: 16, color: 'var(--text)', fontSize: 15, fontWeight: 700 },
  input: {
    width: '100%', padding: '11px 14px', marginBottom: 12,
    border: '1px solid var(--border2)', borderRadius: 10, fontSize: 14,
    background: 'var(--bg3)', color: 'var(--text)', boxSizing: 'border-box',
  },
  error: { color: 'var(--red)', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  submitBtn: {
    width: '100%', padding: '12px 0', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4,
  },
  toggleText: { textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text2)' },
  toggleLink: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 },
};