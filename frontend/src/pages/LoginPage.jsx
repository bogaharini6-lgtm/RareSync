import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('doctor');
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    specialization: '', phone: '', address: '', hospital_id: ''
  });
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
    setStep('credentials');
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

  // Handle OTP input — auto-focus next box
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next box
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      document.getElementById('otp-5')?.focus();
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
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

        if (data.requires_otp) {
          setPendingEmail(form.email);
          setStep('otp');
          setOtp(['', '', '', '', '', '']);
          startResendTimer();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      return setOtpError('Please enter all 6 digits.');
    }
    setLoading(true);
    setOtpError('');
    try {
      const { data } = await API.post(`/auth/${activeTab}/verify-otp`, {
        email: pendingEmail,
        otp: otpValue,
      });
      login(data);
      navigate(activeTab === 'doctor' ? '/doctor/dashboard' : '/hospital/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    try {
      await API.post('/auth/resend-otp', { email: pendingEmail, role: activeTab });
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      startResendTimer();
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
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

          {/* ── CREDENTIALS STEP ── */}
          {step === 'credentials' && (
            <>
              <div style={styles.tabs}>
                <button style={{ ...styles.tab, ...(activeTab === 'doctor' ? styles.tabActive : {}) }} onClick={() => handleTabChange('doctor')}>Doctor</button>
                <button style={{ ...styles.tab, ...(activeTab === 'hospital' ? styles.tabActive : {}) }} onClick={() => handleTabChange('hospital')}>Hospital</button>
              </div>

              <h3 style={styles.formTitle}>
                {isRegister ? `Register as ${activeTab === 'doctor' ? 'Doctor' : 'Hospital'}` : `Login as ${activeTab === 'doctor' ? 'Doctor' : 'Hospital'}`}
              </h3>

              <form onSubmit={handleSubmit}>
                {isRegister && <input style={styles.input} name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />}
                <input style={styles.input} name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
                <input style={styles.input} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />

                {isRegister && activeTab === 'doctor' && (
                  <>
                    <input style={styles.input} name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} />
                    <input style={styles.input} name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
                    <select style={styles.input} name="hospital_id" value={form.hospital_id} onChange={handleChange} required>
                      <option value="">-- Select Hospital --</option>
                      {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
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

                {isRegister && (
  <div style={{ marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
    <input
      type="checkbox"
      id="consent"
      required
      style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, cursor: 'pointer' }}
    />
    <label htmlFor="consent" style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, cursor: 'pointer' }}>
      I agree to the{' '}
      <span
        onClick={() => window.open('/terms', '_blank')}
        style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}
      >
        Terms of Service
      </span>
      {' '}and{' '}
      <span
        onClick={() => window.open('/privacy', '_blank')}
        style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}
      >
        Privacy Policy
      </span>
      . I confirm I am a licensed healthcare professional.
    </label>
  </div>
)}
                <button style={styles.submitBtn} type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : isRegister ? 'Register' : 'Send OTP →'}
                </button>
              </form>

              <p style={styles.toggleText}>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <span style={styles.toggleLink} onClick={handleRegisterToggle}>
                  {isRegister ? 'Login' : 'Register'}
                </span>
              </p>
            </>
          )}

          {/* ── OTP STEP ── */}
          {step === 'otp' && (
            <>
              <div style={styles.otpHeader}>
                <div style={styles.otpIcon}>📧</div>
                <h3 style={{ margin: '12px 0 6px 0', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                  Check your email
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                  We sent a 6-digit OTP to<br />
                  <strong style={{ color: 'var(--text)' }}>{pendingEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP}>
                {/* OTP Boxes */}
                <div style={styles.otpBoxes} onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        ...styles.otpBox,
                        borderColor: otpError ? 'var(--red)' : digit ? 'var(--accent)' : 'var(--border2)',
                        background: digit ? 'var(--bg4)' : 'var(--bg3)',
                        color: digit ? 'var(--accent)' : 'var(--text)',
                      }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {otpError && <p style={styles.error}>{otpError}</p>}

                <button style={styles.submitBtn} type="submit" disabled={loading || otp.join('').length !== 6}>
                  {loading ? 'Verifying...' : 'Verify OTP & Login'}
                </button>
              </form>

              {/* Resend OTP */}
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 8px 0' }}>
                  Didn't receive the OTP?
                </p>
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || resending}
                  style={{
                    background: 'none', border: 'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    color: resendTimer > 0 ? 'var(--text3)' : 'var(--accent)',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {resending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              {/* Back to login */}
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button
                  onClick={() => { setStep('credentials'); setOtp(['', '', '', '', '', '']); setOtpError(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12 }}
                >
                  ← Back to login
                </button>
              </div>

              {/* OTP valid time notice */}
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 16 }}>
                OTP is valid for 10 minutes only
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 32px', background: 'var(--topbar)', borderBottom: '1px solid var(--border)' },
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
  input: { width: '100%', padding: '11px 14px', marginBottom: 12, border: '1px solid var(--border2)', borderRadius: 10, fontSize: 14, background: 'var(--bg3)', color: 'var(--text)', boxSizing: 'border-box' },
  error: { color: 'var(--red)', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  submitBtn: { width: '100%', padding: '12px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  toggleText: { textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text2)' },
  toggleLink: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 },

  // OTP styles
  otpHeader: { textAlign: 'center', marginBottom: 24 },
  otpIcon: { fontSize: 48 },
  otpBoxes: { display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 },
  otpBox: {
    width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 800,
    border: '2px solid', borderRadius: 10, outline: 'none',
    transition: 'all 0.15s', boxSizing: 'border-box',
  },
};