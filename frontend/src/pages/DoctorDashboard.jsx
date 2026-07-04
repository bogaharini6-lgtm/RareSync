import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const STATUS_STYLES = {
  Pending:  { bg: '#fffbeb', color: '#d97706' },
  Approved: { bg: '#f0fff4', color: '#22c55e' },
  Rejected: { bg: '#fff0f0', color: '#e53e3e' },
};

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, reqRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/access/my-requests'),
        ]);
        setData(dashRes.data);
        setMyRequests(reqRes.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load failed');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ padding: 32, fontFamily: 'Arial' }}>Loading dashboard...</div>
  );

  const { stats, recent_patients } = data || {};

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <h1 style={styles.logo}>RareSync</h1>
        <div style={styles.topRight}>
          <span style={styles.userName}>Dr. {user?.name}</span>
          <button onClick={() => navigate('/patients')} style={styles.navBtn}>Patients</button>
          <button onClick={() => navigate('/diseases')} style={styles.navBtn}>Diseases</button>
          <button onClick={() => navigate('/access-requests')} style={styles.navBtn}>Access Requests</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ margin: 0 }}>Doctor Dashboard</h2>
            <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: 14 }}>
              Welcome back, Dr. {user?.name} · {user?.specialization || 'General'}
            </p>
          </div>
          <span style={styles.dateBadge}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard label="Total Patients" value={stats?.patients} emoji="👤" color="#2c7be5" bg="#f0f4ff" onClick={() => navigate('/patients')} />
          <StatCard label="Rare Diseases" value={stats?.diseases} emoji="🧬" color="#7c3aed" bg="#f9f0ff" onClick={() => navigate('/diseases')} />
          <StatCard label="Medical Records" value={stats?.records} emoji="📋" color="#22c55e" bg="#f0fff4" />
          <StatCard label="My Access Requests" value={myRequests.length} emoji="🔐" color="#d97706" bg="#fffbeb" onClick={() => navigate('/access-requests')} />
        </div>

        <div style={styles.twoCol}>
          {/* Recent Patients */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={{ margin: 0 }}>Recent Patients</h3>
              <button onClick={() => navigate('/patients')} style={styles.seeAllBtn}>See All</button>
            </div>
            {recent_patients?.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14 }}>No patients yet.</p>
            ) : (
              recent_patients?.map((p) => (
                <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)} style={styles.patientRow}>
                  <div style={styles.patientAvatar}>{p.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.patientName}>{p.name}</p>
                    <p style={styles.patientMeta}>{p.gender || 'Unknown'} · {p.blood_group || 'N/A'}</p>
                  </div>
                  <span style={styles.patientDate}>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>

          {/* My Access Requests */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={{ margin: 0 }}>My Access Requests</h3>
              <button onClick={() => navigate('/access-requests')} style={styles.seeAllBtn}>See All</button>
            </div>
            {myRequests.length === 0 ? (
              <div>
                <p style={{ color: '#999', fontSize: 14 }}>No access requests yet.</p>
                <button onClick={() => navigate('/access-requests')} style={styles.requestBtn}>
                  + Request Patient Access
                </button>
              </div>
            ) : (
              myRequests.map((r) => {
                const st = STATUS_STYLES[r.status] || STATUS_STYLES.Pending;
                return (
                  <div key={r.id} style={styles.requestRow}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.requestPatient}>{r.patient_name}</p>
                      <p style={styles.requestHospital}>{r.hospital_name}</p>
                      {r.reason && <p style={styles.requestReason}>{r.reason}</p>}
                    </div>
                    <span style={{ ...styles.statusBadge, background: st.bg, color: st.color }}>
                      {r.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.panel}>
          <h3 style={{ margin: '0 0 16px 0' }}>Quick Actions</h3>
          <div style={styles.quickGrid}>
            <QuickAction label="Add Patient" emoji="➕" desc="Register a new patient" onClick={() => navigate('/patients')} color="#2c7be5" />
            <QuickAction label="View Diseases" emoji="🧬" desc="Browse rare diseases" onClick={() => navigate('/diseases')} color="#7c3aed" />
            <QuickAction label="Request Access" emoji="🔐" desc="Request patient access" onClick={() => navigate('/access-requests')} color="#d97706" />
            <QuickAction label="Add Disease" emoji="📝" desc="Add a new rare disease" onClick={() => navigate('/diseases')} color="#22c55e" />
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, emoji, color, bg, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: bg, borderRadius: 10, padding: '20px 24px',
      border: `1px solid ${color}30`, cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 28, fontWeight: 'bold', color, margin: 0 }}>{value ?? '-'}</p>
          <p style={{ fontSize: 13, color, margin: '4px 0 0 0' }}>{label}</p>
        </div>
        <span style={{ fontSize: 28 }}>{emoji}</span>
      </div>
    </div>
  );
}

function QuickAction({ label, emoji, desc, onClick, color }) {
  return (
    <div onClick={onClick} style={{
      padding: '16px 20px', background: '#f7f9fc', borderRadius: 8,
      border: `1px solid ${color}30`, cursor: 'pointer',
    }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <p style={{ fontWeight: 'bold', color, margin: '8px 0 4px 0', fontSize: 14 }}>{label}</p>
      <p style={{ color: '#888', fontSize: 12, margin: 0 }}>{desc}</p>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e5e5e5',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { color: '#2c7be5', margin: 0, fontSize: 22, fontWeight: 'bold' },
  topRight: { display: 'flex', alignItems: 'center', gap: 10 },
  userName: { color: '#444', fontSize: 14, marginRight: 4 },
  navBtn: {
    padding: '7px 14px', background: '#f0f4ff', border: '1px solid #2c7be5',
    color: '#2c7be5', borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  logoutBtn: {
    padding: '7px 14px', background: '#fff', border: '1px solid #ddd',
    borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  container: { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  dateBadge: { color: '#888', fontSize: 13, background: '#fff', padding: '8px 14px', borderRadius: 8, border: '1px solid #eee' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  panel: { background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #eee', marginBottom: 16 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAllBtn: {
    padding: '5px 12px', background: '#f0f4ff', color: '#2c7be5',
    border: '1px solid #2c7be5', borderRadius: 6, cursor: 'pointer', fontSize: 12,
  },
  patientRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
  },
  patientAvatar: {
    width: 36, height: 36, borderRadius: '50%', background: '#2c7be5',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: 16, flexShrink: 0,
  },
  patientName: { fontWeight: '600', fontSize: 14, color: '#222', margin: 0 },
  patientMeta: { color: '#888', fontSize: 12, margin: '2px 0 0 0' },
  patientDate: { color: '#bbb', fontSize: 12 },
  requestRow: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #f5f5f5', gap: 12,
  },
  requestPatient: { fontWeight: '600', fontSize: 14, color: '#222', margin: 0 },
  requestHospital: { color: '#888', fontSize: 12, margin: '2px 0 0 0' },
  requestReason: { color: '#999', fontSize: 12, margin: '4px 0 0 0', fontStyle: 'italic' },
  statusBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 'bold', flexShrink: 0 },
  requestBtn: {
    marginTop: 10, padding: '8px 16px', background: '#2c7be5', color: '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
};