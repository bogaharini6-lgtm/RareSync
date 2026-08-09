import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await API.get('/doctors');
        setDoctors(data);
      } catch (err) {
        console.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Doctors</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0 0' }}>All doctors registered under your hospital</p>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '0 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialization..."
            style={{ flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
        </div>
        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading doctors...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍⚕️</div>
            <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0' }}>No doctors found</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>No doctors registered under your hospital yet</p>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                  {['Doctor', 'Specialization', 'Phone', 'Email', 'Joined'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '13px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg2)' : 'transparent' }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>
                          {d.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Dr. {d.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>ID #{d.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>{d.specialization || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>{d.phone || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>{d.email}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                      {new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg3)' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Showing <strong>{filtered.length}</strong> of <strong>{doctors.length}</strong> doctors</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
