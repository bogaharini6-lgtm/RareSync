import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 32, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#2c7be5', margin: 0 }}>RareSync</h1>
        <button onClick={() => { logout(); navigate('/login'); }}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: 6, border: '1px solid #ddd' }}>
          Logout
        </button>
      </div>
      <h2>Welcome, {user?.name}</h2>
      <p style={{ color: '#666' }}>Full dashboard stats coming Day 7</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <NavCard label="Patients" emoji="👤" onClick={() => navigate('/patients')} color="#2c7be5" />
        <NavCard label="Rare Diseases" emoji="🧬" onClick={() => navigate('/diseases')} color="#7c3aed" />
        <NavCard label="Access Requests" emoji="🔐" onClick={() => navigate('/access-requests')} color="#d97706" />
        <NavCard label="Audit Logs" emoji="📋" onClick={() => navigate('/audit-logs')} color="#22c55e" />
      </div>
    </div>
  );
}

function NavCard({ label, emoji, onClick, color }) {
  return (
    <div onClick={onClick} style={{
      padding: '20px 28px', background: '#fff', borderRadius: 10,
      border: `2px solid ${color}`, cursor: 'pointer', textAlign: 'center', minWidth: 130,
    }}>
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <p style={{ color, fontWeight: 'bold', margin: '8px 0 0 0', fontSize: 14 }}>{label}</p>
    </div>
  );
}