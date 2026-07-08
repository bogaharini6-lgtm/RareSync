import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
  RecordsByTypeChart,
  AccessRequestsChart,
  DiseaseDistributionChart,
  MonthlyPatientsChart,
} from '../components/DashboardCharts';

const ACTION_LABELS = {
  patient_created:  { label: 'Patient Created',  color: '#22c55e' },
  patient_updated:  { label: 'Patient Updated',  color: '#d97706' },
  patient_deleted:  { label: 'Patient Deleted',  color: '#e53e3e' },
  record_created:   { label: 'Record Added',      color: '#2c7be5' },
  record_updated:   { label: 'Record Updated',    color: '#2c7be5' },
  record_viewed:    { label: 'Record Viewed',     color: '#7c3aed' },
  access_requested: { label: 'Access Requested',  color: '#d97706' },
  access_approved:  { label: 'Access Approved',   color: '#22c55e' },
  access_rejected:  { label: 'Access Rejected',   color: '#e53e3e' },
};

export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard load failed');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div style={{ padding: 32, fontFamily: 'Arial' }}>
      <h2 style={{ color: '#2c7be5' }}>RareSync</h2>
      <p>Loading dashboard...</p>
    </div>
  );

  const {
    stats,
    records_by_type,
    monthly_patients,
    disease_distribution,
    access_requests_chart,
    recent_activity,
    recent_patients,
  } = data || {};

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <h1 style={styles.logo}>RareSync</h1>
        <div style={styles.topRight}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={() => navigate('/patients')} style={styles.navBtn}>Patients</button>
          <button onClick={() => navigate('/diseases')} style={styles.navBtn}>Diseases</button>
          <button onClick={() => navigate('/access-requests')} style={styles.navBtn}>Access Requests</button>
          <button onClick={() => navigate('/audit-logs')} style={styles.navBtn}>Audit Logs</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ margin: 0 }}>Hospital Dashboard</h2>
            <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: 14 }}>
              Welcome back, {user?.name}
            </p>
          </div>
          <span style={styles.dateBadge}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatCard label="Total Patients"      value={stats?.patients}         emoji="👤" color="#2c7be5" bg="#f0f4ff" onClick={() => navigate('/patients')} />
          <StatCard label="Total Doctors"       value={stats?.doctors}          emoji="👨‍⚕️" color="#7c3aed" bg="#f9f0ff" />
          <StatCard label="Rare Diseases"       value={stats?.diseases}         emoji="🧬" color="#d97706" bg="#fffbeb" onClick={() => navigate('/diseases')} />
          <StatCard label="Medical Records"     value={stats?.records}          emoji="📋" color="#22c55e" bg="#f0fff4" />
          <StatCard label="Pending Requests"    value={stats?.pending_requests} emoji="🔐" color="#e53e3e" bg="#fff0f0" onClick={() => navigate('/access-requests')} />
          <StatCard label="New This Month"      value={stats?.new_patients}     emoji="🆕" color="#0891b2" bg="#f0fdff" />
        </div>

        {/* Charts Row 1 */}
        <div style={styles.chartsGrid}>
          <MonthlyPatientsChart data={monthly_patients} />
          <RecordsByTypeChart data={records_by_type} />
        </div>

        {/* Charts Row 2 */}
        <div style={styles.chartsGrid}>
          <DiseaseDistributionChart data={disease_distribution} />
          <AccessRequestsChart data={access_requests_chart} />
        </div>

        {/* Bottom Row */}
        <div style={styles.twoCol}>
          {/* Recent Patients */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={{ margin: 0 }}>Recent Patients</h3>
              <button onClick={() => navigate('/patients')} style={styles.seeAllBtn}>See All</button>
            </div>
            {!recent_patients?.length ? (
              <p style={{ color: '#999', fontSize: 14 }}>No patients yet.</p>
            ) : (
              recent_patients.map((p) => (
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

          {/* Recent Activity */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={{ margin: 0 }}>Recent Activity</h3>
              <button onClick={() => navigate('/audit-logs')} style={styles.seeAllBtn}>See All</button>
            </div>
            {!recent_activity?.length ? (
              <p style={{ color: '#999', fontSize: 14 }}>No activity yet.</p>
            ) : (
              recent_activity.map((log, i) => {
                const ac = ACTION_LABELS[log.action] || { label: log.action, color: '#888' };
                return (
                  <div key={i} style={styles.activityRow}>
                    <div style={{ ...styles.activityDot, background: ac.color }} />
                    <div style={{ flex: 1 }}>
                      <p style={styles.activityAction}>{ac.label}</p>
                      <p style={styles.activityMeta}>{log.actor_name} · {log.details}</p>
                    </div>
                    <span style={styles.activityTime}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
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
  dateBadge: {
    color: '#888', fontSize: 13, background: '#fff',
    padding: '8px 14px', borderRadius: 8, border: '1px solid #eee',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
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
  activityRow: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 0', borderBottom: '1px solid #f5f5f5',
  },
  activityDot: { width: 10, height: 10, borderRadius: '50%', marginTop: 4, flexShrink: 0 },
  activityAction: { fontWeight: '600', fontSize: 13, color: '#333', margin: 0 },
  activityMeta: { color: '#999', fontSize: 12, margin: '2px 0 0 0' },
  activityTime: { color: '#bbb', fontSize: 12, flexShrink: 0 },
};