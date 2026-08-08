import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDoctor = user?.role === 'doctor';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/profile');
      setProfile(data);
      setForm(data);
    } catch (err) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/profile/update', form);
      showMessage('success', 'Profile updated successfully.');
      fetchProfile();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return showMessage('error', 'New passwords do not match.');
    }
    if (passwordForm.new_password.length < 6) {
      return showMessage('error', 'Password must be at least 6 characters.');
    }
    setSaving(true);
    try {
      await API.put('/profile/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      showMessage('success', 'Password changed successfully.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: 32, color: 'var(--text2)' }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 32px' }}>

        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarLarge}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={styles.profileName}>
              {isDoctor ? `Dr. ${profile?.name}` : profile?.name}
            </h2>
            <p style={styles.profileRole}>
              {isDoctor ? profile?.specialization || 'Doctor' : 'Hospital Administrator'}
            </p>
            {isDoctor && (
              <p style={styles.profileHospital}>🏥 {profile?.hospital_name}</p>
            )}
            <p style={styles.profileSince}>
              Member since {new Date(profile?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            ...styles.messageBanner,
            background: message.type === 'success' ? 'var(--gbg)' : 'var(--rbg)',
            border: `1px solid ${message.type === 'success' ? 'var(--gborder)' : 'var(--rborder)'}`,
            color: message.type === 'success' ? 'var(--green)' : 'var(--red)',
          }}>
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'profile', label: '👤 Profile Info' },
            { key: 'professional', label: isDoctor ? '🩺 Professional Details' : '🏥 Hospital Details' },
            { key: 'password', label: '🔒 Change Password' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                ...styles.tab,
                ...(activeTab === t.key ? styles.tabActive : {}),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE INFO TAB ── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} style={styles.card}>
            <h3 style={styles.cardTitle}>Basic Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input style={styles.input} name="name" value={form.name || ''} onChange={handleChange} placeholder="Full name" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input style={{ ...styles.input, background: 'var(--bg3)', color: 'var(--text3)' }} value={profile?.email || ''} disabled />
                <p style={{ fontSize: 11, color: 'var(--text3)', margin: '4px 0 0 0' }}>Email cannot be changed here</p>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input style={styles.input} name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone number" />
              </div>
              {isDoctor && (
                <div style={styles.field}>
                  <label style={styles.label}>Specialization</label>
                  <input style={styles.input} name="specialization" value={form.specialization || ''} onChange={handleChange} placeholder="e.g. Neurologist" />
                </div>
              )}
              {!isDoctor && (
                <div style={styles.field}>
                  <label style={styles.label}>Address</label>
                  <input style={styles.input} name="address" value={form.address || ''} onChange={handleChange} placeholder="Hospital address" />
                </div>
              )}
            </div>
            <button type="submit" style={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* ── PROFESSIONAL DETAILS TAB ── */}
        {activeTab === 'professional' && (
          <form onSubmit={handleSaveProfile} style={styles.card}>
            {isDoctor ? (
              <>
                <h3 style={styles.cardTitle}>Professional Details</h3>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Years of Experience</label>
                    <input style={styles.input} name="experience_years" type="number" min="0" max="60" value={form.experience_years || ''} onChange={handleChange} placeholder="e.g. 10" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Languages Spoken</label>
                    <input style={styles.input} name="languages" value={form.languages || ''} onChange={handleChange} placeholder="e.g. English, Hindi, Tamil" />
                  </div>
                  <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Education & Qualifications</label>
                    <textarea style={styles.textarea} name="education" value={form.education || ''} onChange={handleChange} placeholder="e.g. MBBS - AIIMS Delhi (2010), MD Neurology - PGI Chandigarh (2014)" rows={3} />
                  </div>
                  <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>About / Bio</label>
                    <textarea style={styles.textarea} name="bio" value={form.bio || ''} onChange={handleChange} placeholder="Write a brief professional bio about yourself..." rows={4} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 style={styles.cardTitle}>Hospital Details</h3>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Established Year</label>
                    <input style={styles.input} name="established_year" type="number" min="1800" max="2024" value={form.established_year || ''} onChange={handleChange} placeholder="e.g. 1995" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Number of Beds</label>
                    <input style={styles.input} name="bed_count" type="number" min="0" value={form.bed_count || ''} onChange={handleChange} placeholder="e.g. 200" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Website</label>
                    <input style={styles.input} name="website" value={form.website || ''} onChange={handleChange} placeholder="e.g. https://cityhospital.com" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Specialties / Departments</label>
                    <input style={styles.input} name="specialties" value={form.specialties || ''} onChange={handleChange} placeholder="e.g. Neurology, Cardiology, Oncology" />
                  </div>
                  <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>About the Hospital</label>
                    <textarea style={styles.textarea} name="description" value={form.description || ''} onChange={handleChange} placeholder="Write about your hospital's history, mission and services..." rows={5} />
                  </div>
                </div>
              </>
            )}
            <button type="submit" style={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </form>
        )}

        {/* ── CHANGE PASSWORD TAB ── */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={styles.card}>
            <h3 style={styles.cardTitle}>Change Password</h3>
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 20px 0' }}>
              Choose a strong password with at least 6 characters.
            </p>
            <div style={{ maxWidth: 400 }}>
              <div style={{ ...styles.field, marginBottom: 14 }}>
                <label style={styles.label}>Current Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div style={{ ...styles.field, marginBottom: 14 }}>
                <label style={styles.label}>New Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div style={{ ...styles.field, marginBottom: 20 }}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  style={{
                    ...styles.input,
                    borderColor: passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password ? 'var(--red)' : 'var(--border2)',
                  }}
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
                {passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
                  <p style={{ color: 'var(--red)', fontSize: 12, margin: '4px 0 0 0' }}>Passwords do not match</p>
                )}
              </div>
              <button type="submit" style={styles.saveBtn} disabled={saving}>
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>

            {/* Password tips */}
            <div style={styles.passwordTips}>
              <p style={styles.tipsTitle}>Password tips:</p>
              <ul style={styles.tipsList}>
                <li>At least 6 characters long</li>
                <li>Mix of uppercase and lowercase letters</li>
                <li>Include numbers and special characters</li>
                <li>Avoid using your name or email</li>
              </ul>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

const styles = {
  profileHeader: {
    display: 'flex', alignItems: 'center', gap: 20,
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 14, padding: 24, marginBottom: 20,
  },
  avatarLarge: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 800, flexShrink: 0,
  },
  profileName: { fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 },
  profileRole: { color: 'var(--accent)', fontSize: 14, fontWeight: 600, margin: '4px 0' },
  profileHospital: { color: 'var(--text2)', fontSize: 13, margin: '2px 0' },
  profileSince: { color: 'var(--text3)', fontSize: 12, margin: '4px 0 0 0' },
  messageBanner: {
    padding: '12px 16px', borderRadius: 8, marginBottom: 16,
    fontSize: 14, fontWeight: 600,
  },
  tabs: {
    display: 'flex', gap: 4, marginBottom: 16,
    background: 'var(--bg3)', padding: 4, borderRadius: 10,
    border: '1px solid var(--border)',
  },
  tab: {
    flex: 1, padding: '10px 16px', border: 'none',
    background: 'transparent', color: 'var(--text2)',
    borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  tabActive: {
    background: 'var(--card)', color: 'var(--accent)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 24,
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border2)',
    fontSize: 14, background: 'var(--bg3)', color: 'var(--text)', boxSizing: 'border-box',
  },
  textarea: {
    padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border2)',
    fontSize: 14, background: 'var(--bg3)', color: 'var(--text)',
    resize: 'vertical', fontFamily: 'Arial, sans-serif', lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  saveBtn: {
    padding: '11px 24px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700,
  },
  passwordTips: {
    marginTop: 24, padding: 16, background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: 8,
    maxWidth: 400,
  },
  tipsTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text2)', margin: '0 0 8px 0' },
  tipsList: { paddingLeft: 18, color: 'var(--text3)', fontSize: 12, lineHeight: 2, margin: 0 },
};