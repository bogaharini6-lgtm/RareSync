import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { RecordsByTypeChart, MonthlyPatientsChart, DiseaseDistributionChart, AccessRequestsChart } from '../components/DashboardCharts';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/dashboard');
        setData(data);
      } catch (err) { console.error('Dashboard load failed'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const { stats, records_by_type, monthly_patients, disease_distribution, access_requests_chart, recent_patients } = data || {};

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
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Hospital Dashboard</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, margin: '4px 0 0 0' }}>Welcome back, {user?.name}</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px' }}>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Patients"   value={stats?.patients} icon="👥" color="#4f7fff" onClick={() => navigate('/patients')} />
          <StatCard label="Total Doctors"    value={stats?.doctors}  icon="👨‍⚕️" color="#a855f7" onClick={() => navigate('/doctors')} />
          <StatCard label="Rare Diseases"    value={stats?.diseases} icon="🧬" color="#f59e0b" onClick={() => navigate('/diseases')} />
          <StatCard label="Medical Records"  value={stats?.records}  icon="📋" color="#22c55e" onClick={() => navigate('/patients')} />
          <StatCard label="Pending Requests" value={stats?.pending_requests} icon="🔐" color="#ef4444" onClick={() => navigate('/access-requests')} />
          <StatCard label="New This Month"   value={stats?.new_this_month}   icon="🆕" color="#06b6d4" />
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
            <DiseaseDistributionChart data={disease_distribution} />
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
            <AccessRequestsChart data={access_requests_chart} />
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Recent Patients</h3>
            <button onClick={() => navigate('/patients')} style={S.seeAllBtn}>See All</button>
          </div>
          {!recent_patients?.length ? (
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>No patients yet.</p>
          ) : (
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
};
