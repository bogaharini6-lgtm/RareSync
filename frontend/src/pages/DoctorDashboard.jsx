import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#2c7be5' }}>RareSync</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      <h2>Welcome, Dr. {user?.name}</h2>
      <p style={{ color: '#666' }}>Hospital Dashboard — Full UI coming Day 7</p>
<button
  onClick={() => navigate('/patients')}
  style={{ marginTop: 16, padding: '10px 20px', background: '#2c7be5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
>
  View Patients
</button>
    </div>
  );
}