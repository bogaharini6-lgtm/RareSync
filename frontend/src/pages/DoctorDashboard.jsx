import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { RecordsByTypeChart, MonthlyPatientsChart } from '../components/DashboardCharts';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, reqRes] = await Promise.all([API.get('/dashboard'), API.get('/access/my-requests')]);
        setData(dashRes.data);
        setMyRequests(reqRes.data.slice(0, 5));
      } catch (err) { console.error('Dashboard load failed'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const { stats, records_by_type, monthly_patients, recent_patients } = data || {};
  const userName = user?.name?.startsWith('Dr.') ? user?.name : 'Dr. ' + user?.name;

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text2)' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Doctor Dashboard</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, margin: '4px 0 0 0' }}>Welcome back, {userName} · {user?.specialization || 'General'}</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px' }}>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Patients"     value={stats?.patients}   icon="👥" color="#4f7fff" onClick={() => navigate('/patients')} />
          <StatCard label="Rare Diseases"      value={stats?.diseases}   icon="🧬" color="#a855f7" onClick={() => navigate('/diseases')} />
          <StatCard label="Medical Records"    value={stats?.records}    icon="📋" color="#22c55e" />
          <StatCard label="My Access Requests" value={myRequests.length} icon="🔐" color="#f59e0b" onClick={() => navigate('/access-requests')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
            <MonthlyPatientsChart data={monthly_patients} />
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
            <RecordsByTypeChart data={records_by_type} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Recent Patients</h3>
              <button onClick={() => navigate('/patients')} style={S.seeAllBtn}>See All</button>
            </div>
            {!recent_patients?.length ? <p style={{ color: 'var(--text3)', fontSize: 14 }}>No patients yet.</p> : (
              recent_patients.map((p) => (
                <div key={p.id} onClick={() => navigate('/patients/' + p.id)} style={S.listRow}>
                  <div style={S.avatar}>{p.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={S.rowTitle}>{p.name}</p>
                    <p style={S.rowSub}>{p.gender || 'Unknown'} · {p.blood_group || 'N/A'}</p>
                  </div>
                  <span style={S.rowDate}>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>

          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>My Access Requests</h3>
              <button onClick={() => navigate('/access-requests')} style={S.seeAllBtn}>See All</button>
            </div>
            {myRequests.length === 0 ? (
              <div>
                <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 12 }}>No access requests yet.</p>
                <button onClick={() => navigate('/access-requests')} style={S.actionBtn}>+ Request Patient Access</button>
              </div>
            ) : myRequests.map((r) => {
              const st = { Pending: { bg: 'var(--obg)', color: 'var(--orange)' }, Approved: { bg: 'var(--gbg)', color: 'var(--green)' }, Rejected: { bg: 'var(--rbg)', color: 'var(--red)' } }[r.status] || {};
              return (
                <div key={r.id} style={S.listRow}>
                  <div style={{ flex: 1 }}>
                    <p style={S.rowTitle}>{r.patient_name}</p>
                    <p style={S.rowSub}>{r.hospital_name}</p>
                  </div>
                  <span style={{ ...S.badge, background: st.bg, color: st.color }}>{r.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Add Patient', icon: '➕', desc: 'Register a new patient', path: '/patients', color: '#4f7fff' },
              { label: 'View Diseases', icon: '🧬', desc: 'Browse rare diseases', path: '/diseases', color: '#a855f7' },
              { label: 'Request Access', icon: '🔐', desc: 'Request patient access', path: '/access-requests', color: '#f59e0b' },
              { label: 'My Requests', icon: '📋', desc: 'View specialist requests', path: '/specialist-requests', color: '#22c55e' },
            ].map((a) => (
              <div key={a.label} onClick={() => navigate(a.path)}
                style={{ padding: 16, background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' }}>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <p style={{ fontWeight: 700, color: a.color, margin: '8px 0 4px 0', fontSize: 13 }}>{a.label}</p>
                <p style={{ color: 'var(--text3)', fontSize: 12, margin: 0 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background: 'var(--card)', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--border)', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.borderColor = color; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 30, fontWeight: 800, color, margin: 0 }}>{value ?? '-'}</p>
          <p style={{ fontSize: 13, color: 'var(--text2)', margin: '6px 0 0 0' }}>{label}</p>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      </div>
    </div>
  );
}

const S = {
  seeAllBtn: { padding: '5px 12px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  listRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4f7fff, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 },
  rowTitle: { fontWeight: 700, fontSize: 14, color: 'var(--text)', margin: 0 },
  rowSub: { color: 'var(--text3)', fontSize: 12, margin: '2px 0 0 0' },
  rowDate: { color: 'var(--text3)', fontSize: 12, flexShrink: 0 },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 },
  actionBtn: { padding: '9px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
};
