import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user } = useAuth();
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

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ new_email: '', password: '' });

  // Eye toggle states
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/profile');
      setProfile(data);
      setForm(data);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/profile/update', form);
      showMessage('success', 'Profile updated successfully.');
      await fetchProfile();
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      return showMessage('error', 'Please fill in all password fields.');
    }
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
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('incorrect')) {
        showMessage('error', 'Current password is incorrect.');
      } else {
        showMessage('error', msg || 'Failed to change password.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!emailForm.new_email || !emailForm.password) {
      return showMessage('error', 'Please fill in both fields.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.new_email)) {
      return showMessage('error', 'Please enter a valid email address.');
    }
    if (profile?.email?.toLowerCase() === emailForm.new_email.toLowerCase()) {
      return showMessage('error', 'New email must be different from your current email.');
    }
    setSaving(true);
    try {
      const { data } = await API.put('/profile/change-email', {
        new_email: emailForm.new_email,
        password: emailForm.password,
      });
      showMessage('success', 'Email updated successfully. Please login again with your new email.');
      setShowEmailForm(false);
      setEmailForm({ new_email: '', password: '' });
      setProfile((prev) => ({ ...prev, email: data.new_email || emailForm.new_email }));
      setForm((prev) => ({ ...prev, email: data.new_email || emailForm.new_email }));
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.email = data.new_email || emailForm.new_email;
      localStorage.setItem('user', JSON.stringify(stored));
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('incorrect')) {
        showMessage('error', 'Current password is incorrect.');
      } else {
        showMessage('error', msg || 'Failed to update email.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: 32, color: 'var(--text2)' }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 32px' }}>

        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarLarge}>{profile?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <h2 style={styles.profileName}>{isDoctor ? `Dr. ${profile?.name}` : profile?.name}</h2>
            <p style={styles.profileRole}>{isDoctor ? profile?.specialization || 'Doctor' : 'Hospital Administrator'}</p>
            {isDoctor && <p style={styles.profileHospital}>🏥 {profile?.hospital_name || 'Hospital not assigned'}</p>}
            <p style={styles.profileSince}>
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div style={{
            ...styles.messageBanner,
            background: message.type === 'success' ? 'var(--gbg)' : 'var(--rbg)',
            border: message.type === 'success' ? '1px solid var(--gborder)' : '1px solid var(--rborder)',
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
          ].map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}>
              {tab.label}
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
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...styles.input, flex: 1 }} type="email" value={form.email || ''} disabled />
                  <button type="button"
                    onClick={() => { setShowEmailForm(!showEmailForm); if (!showEmailForm) setEmailForm({ new_email: '', password: '' }); }}
                    style={styles.changeEmailBtn}>
                    {showEmailForm ? 'Close' : 'Change'}
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input style={styles.input} name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Phone number" />
              </div>

              {/* Email Change Form */}
              {showEmailForm && (
                <div style={{ gridColumn: '1 / -1', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: 16, marginTop: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px 0' }}>Change Email Address</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                    <div style={styles.field}>
                      <label style={styles.label}>New Email Address</label>
                      <input style={styles.input} type="email" value={emailForm.new_email}
                        onChange={(e) => setEmailForm({ ...emailForm, new_email: e.target.value })}
                        placeholder="Enter new email address" />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Current Password</label>
                      <div style={styles.passwordWrap}>
                        <input
                          style={{ ...styles.input, flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px 14px', width: 'auto' }}
                          type={showEmailPassword ? 'text' : 'password'}
                          value={emailForm.password}
                          onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                          placeholder="Enter your current password"
                        />
                        <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)} style={styles.eyeBtn}>
                          {showEmailPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={handleChangeEmail}
                      disabled={saving || !emailForm.new_email || !emailForm.password}
                      style={{ padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: saving || !emailForm.new_email || !emailForm.password ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: !emailForm.new_email || !emailForm.password ? 0.6 : 1 }}>
                      {saving ? 'Updating...' : 'Update Email'}
                    </button>
                    <button type="button" onClick={() => { setShowEmailForm(false); setEmailForm({ new_email: '', password: '' }); }} style={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" style={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* ── PROFESSIONAL / HOSPITAL DETAILS TAB ── */}
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
                    <input style={styles.input} name="established_year" type="number" min="1800" max="2030" value={form.established_year || ''} onChange={handleChange} placeholder="e.g. 1995" />
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
            <div style={{ maxWidth: 420 }}>

              {/* Current Password */}
              <div style={{ ...styles.field, marginBottom: 14 }}>
                <label style={styles.label}>Current Password</label>
                <div style={styles.passwordWrap}>
                  <input
                    style={{ ...styles.input, flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px 14px', width: 'auto' }}
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeBtn}>
                    {showCurrentPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={{ ...styles.field, marginBottom: 14 }}>
                <label style={styles.label}>New Password</label>
                <div style={styles.passwordWrap}>
                  <input
                    style={{ ...styles.input, flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px 14px', width: 'auto' }}
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={styles.eyeBtn}>
                    {showNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ ...styles.field, marginBottom: 20 }}>
                <label style={styles.label}>Confirm New Password</label>
                <div style={{
                  ...styles.passwordWrap,
                  borderColor: passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password ? 'var(--red)' : 'var(--border2)',
                }}>
                  <input
                    style={{ ...styles.input, flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '10px 14px', width: 'auto' }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
                  <p style={{ color: 'var(--red)', fontSize: 12, margin: '4px 0 0 0' }}>Passwords do not match</p>
                )}
              </div>

              <button type="submit" style={styles.saveBtn} disabled={saving}>
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>

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
  profileHeader: { display: 'flex', alignItems: 'center', gap: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 },
  avatarLarge: { width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 },
  profileName: { fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 },
  profileRole: { color: 'var(--accent)', fontSize: 14, fontWeight: 600, margin: '4px 0' },
  profileHospital: { color: 'var(--text2)', fontSize: 13, margin: '2px 0' },
  profileSince: { color: 'var(--text3)', fontSize: 12, margin: '4px 0 0 0' },
  messageBanner: { padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 600 },
  tabs: { display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg3)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' },
  tab: { flex: 1, padding: '10px 16px', border: 'none', background: 'transparent', color: 'var(--text2)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  tabActive: { background: 'var(--card)', color: 'var(--accent)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border2)', fontSize: 14, background: 'var(--bg3)', color: 'var(--text)', boxSizing: 'border-box', width: '100%' },
  passwordWrap: { display: 'flex', alignItems: 'center', border: '1px solid var(--border2)', borderRadius: 8, background: 'var(--bg3)', overflow: 'hidden' },
  eyeBtn: { padding: '0 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)', display: 'flex', alignItems: 'center', flexShrink: 0, height: '100%' },
  textarea: { padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border2)', fontSize: 14, background: 'var(--bg3)', color: 'var(--text)', resize: 'vertical', fontFamily: 'Arial, sans-serif', lineHeight: 1.6, boxSizing: 'border-box' },
  saveBtn: { padding: '11px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  changeEmailBtn: { padding: '10px 14px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' },
  cancelBtn: { padding: '9px 16px', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  passwordTips: { marginTop: 24, padding: 16, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, maxWidth: 400 },
  tipsTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text2)', margin: '0 0 8px 0' },
  tipsList: { paddingLeft: 18, color: 'var(--text3)', fontSize: 12, lineHeight: 2, margin: 0 },
};