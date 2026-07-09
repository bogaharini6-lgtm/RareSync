import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = user?.role === 'hospital'
    ? [
        { label: 'Dashboard', path: '/hospital/dashboard' },
        { label: 'Patients', path: '/patients' },
        { label: 'Diseases', path: '/diseases' },
        { label: 'Access Requests', path: '/access-requests' },
        { label: 'Audit Logs', path: '/audit-logs' },
      ]
    : [
        { label: 'Dashboard', path: '/doctor/dashboard' },
        { label: 'Patients', path: '/patients' },
        { label: 'Diseases', path: '/diseases' },
        { label: 'Access Requests', path: '/access-requests' },
      ];

  return (
    <nav style={styles.nav}>
      <div
        style={styles.logo}
        onClick={() => navigate(user?.role === 'hospital' ? '/hospital/dashboard' : '/doctor/dashboard')}
      >
        Rare<span style={{ color: 'var(--accent2)' }}>Sync</span>
      </div>

      <div style={styles.navLinks}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.navBtn,
              ...(isActive(item.path) ? styles.navBtnActive : {}),
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={styles.right}>
        <span style={styles.userName}>
          {user?.role === 'doctor' ? `Dr. ${user?.name}` : user?.name}
        </span>
        <button onClick={toggleTheme} style={styles.themeBtn} title="Toggle theme">
          {isDark ? '☀️' : '🌑'}
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    height: 56,
    background: 'var(--topbar)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--accent)',
    cursor: 'pointer',
    letterSpacing: '-0.5px',
    flexShrink: 0,
  },
  navLinks: {
    display: 'flex',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  navBtn: {
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    color: 'var(--text2)',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
  },
  navBtnActive: {
    background: 'var(--bg4)',
    color: 'var(--accent)',
    fontWeight: 700,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  userName: {
    fontSize: 12,
    color: 'var(--text2)',
    fontWeight: 500,
  },
  themeBtn: {
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: 14,
  },
  logoutBtn: {
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    color: 'var(--text2)',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600,
  },
};