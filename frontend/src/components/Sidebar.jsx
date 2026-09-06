import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const doctorNav = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: '⬡' },
    { label: 'Patients', path: '/patients', icon: '👥' },
    { label: 'Diseases', path: '/diseases', icon: '🧬' },
    { label: 'Access Requests', path: '/access-requests', icon: '🔐' },
    { label: 'Specialist Requests', path: '/specialist-requests', icon: '🩺' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  const hospitalNav = [
    { label: 'Dashboard', path: '/hospital/dashboard', icon: '⬡' },
    { label: 'Patients', path: '/patients', icon: '👥' },
    { label: 'Doctors', path: '/doctors', icon: '👨‍⚕️' },
    { label: 'Diseases', path: '/diseases', icon: '🧬' },
    { label: 'Access Requests', path: '/access-requests', icon: '🔐' },
    { label: 'Audit Logs', path: '/audit-logs', icon: '📋' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  const navItems = user?.role === 'hospital' ? hospitalNav : doctorNav;

  const userName = user?.role === 'doctor'
    ? (user?.name?.startsWith('Dr.') ? user?.name : 'Dr. ' + user?.name)
    : user?.name;

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoWrap} onClick={() => navigate(user?.role === 'hospital' ? '/hospital/dashboard' : '/doctor/dashboard')}>
        <div style={styles.logoIcon}>R</div>
        <span style={styles.logoText}>Rare<span style={{ color: '#7c3aed' }}>Sync</span></span>
      </div>

      {/* User Info */}
      <div style={styles.userCard}>
        <div style={styles.userAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.userName}>{userName}</p>
          <p style={styles.userRole}>{user?.role === 'hospital' ? 'Hospital Admin' : user?.specialization || 'Doctor'}</p>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav Items */}
      <nav style={styles.nav}>
        <p style={styles.navLabel}>MENU</p>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel2}>{item.label}</span>
            {isActive(item.path) && <div style={styles.activeIndicator} />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.divider} />
        <button onClick={toggleTheme} style={styles.bottomBtn}>
          <span>{isDark ? '☀️' : '🌑'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: 'var(--sidebar)',
    borderRight: '1px solid var(--border)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 16px 0',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 20px 16px 20px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #4f7fff, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 900,
    flexShrink: 0,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.5px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '0 12px 12px 12px',
    padding: '10px 12px',
    background: 'var(--bg3)',
    borderRadius: 10,
    border: '1px solid var(--border)',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f7fff, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
  },
  userName: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  userRole: {
    fontSize: 10,
    color: 'var(--text3)',
    margin: '2px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '8px 0',
  },
  nav: {
    flex: 1,
    padding: '4px 12px',
    overflowY: 'auto',
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: 'var(--text3)',
    letterSpacing: 1.5,
    padding: '8px 8px 6px 8px',
    margin: 0,
  },
  navLabel2: {
    fontSize: 13,
    fontWeight: 500,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    color: 'var(--text2)',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    marginBottom: 2,
    fontSize: 13,
  },
  navItemActive: {
    background: 'rgba(79,127,255,0.12)',
    color: '#4f7fff',
    fontWeight: 700,
  },
  navIcon: {
    fontSize: 15,
    flexShrink: 0,
    width: 20,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 20,
    background: '#4f7fff',
    borderRadius: '3px 0 0 3px',
  },
  bottom: {
    padding: '0 12px',
  },
  bottomBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    color: 'var(--text2)',
    cursor: 'pointer',
    fontSize: 13,
    marginBottom: 2,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    color: 'var(--red)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
};
