import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 32, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#2c7be5' }}>RareSync</h1>
        <button onClick={() => { logout(); navigate('/login'); }}
          style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
      </div>
      <h2>Welcome, Dr. {user?.name}</h2>
      <p style={{ color: '#666' }}>Doctor Dashboard — Full UI coming Day 7</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={() => navigate('/patients')}
          style={{ padding: '10px 20px', background: '#2c7be5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Patients
        </button>
        <button onClick={() => navigate('/diseases')}
          style={{ padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Rare Diseases
        </button>
      </div>
    </div>
  );
}