import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' or 'hospital'
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    specialization: '', phone: '', address: '', hospital_id: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
        const { data } = await API.post(`/auth/${activeTab}/login`, {
          email: form.email,
          password: form.password,
        });
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
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoText}>RareSync</span>
          <p style={styles.logoSub}>Rare Disease Management Platform</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'doctor' ? styles.tabActive : {}) }}
            onClick={() => handleTabChange('doctor')}
          >
            Doctor
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'hospital' ? styles.tabActive : {}) }}
            onClick={() => handleTabChange('hospital')}
          >
            Hospital
          </button>
        </div>

        {/* Form Title */}
        <h3 style={styles.formTitle}>
          {isRegister
            ? `Register as ${activeTab === 'doctor' ? 'Doctor' : 'Hospital'}`
            : `Login as ${activeTab === 'doctor' ? 'Doctor' : 'Hospital'}`}
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              style={styles.input}
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {isRegister && activeTab === 'doctor' && (
            <>
              <input
                style={styles.input}
                name="specialization"
                placeholder="Specialization (e.g. Neurologist)"
                value={form.specialization}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />
              <select
                style={styles.input}
                name="hospital_id"
                value={form.hospital_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Hospital --</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </>
          )}

          {isRegister && activeTab === 'hospital' && (
            <>
              <input
                style={styles.input}
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />
              <input
                style={styles.input}
                name="address"
                placeholder="Hospital Address"
                value={form.address}
                onChange={handleChange}
              />
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        {/* Toggle Register/Login */}
        <p style={styles.toggleText}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={styles.toggleLink} onClick={handleRegisterToggle}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  },
  logo: { textAlign: 'center', marginBottom: 24 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#2c7be5' },
  logoSub: { color: '#888', fontSize: 13, marginTop: 4 },
  tabs: {
    display: 'flex',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #2c7be5',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: '10px 0',
    border: 'none',
    background: '#fff',
    color: '#2c7be5',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: '500',
  },
  tabActive: {
    background: '#2c7be5',
    color: '#fff',
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: 12,
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px 0',
    background: '#2c7be5',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 4,
  },
  error: {
    color: '#e53e3e',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    color: '#666',
  },
  toggleLink: {
    color: '#2c7be5',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};