import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function SpecialistRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/collaboration/specialist-requests');
        setRequests(data);
      } catch (err) {
        console.error('Failed to load specialist requests');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRespond = async (id, status) => {
    setResponding(id);
    try {
      await API.put(`/collaboration/specialist-request/${id}/respond`, { status });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond.');
    } finally {
      setResponding(null);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 32px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px 0' }}>
          🧑‍⚕️ Specialist Opinion Requests
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 24px 0' }}>
          Doctors have requested your specialist opinion on these cases
        </p>

        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading...</p>
        ) : requests.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧑‍⚕️</div>
            <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>No pending requests</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 6 }}>You have no pending specialist opinion requests</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    Dr. {req.requested_by_name} has requested your opinion
                  </p>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text2)' }}>
                    Patient: <strong>{req.patient_name}</strong>
                  </p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--obg)', color: 'var(--orange)', border: '1px solid var(--oborder)', fontSize: 11, fontWeight: 700 }}>
                  Pending
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Opinion Type</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{req.opinion_type}</p>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>Case</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{req.room_title}</p>
                </div>
              </div>

              {req.message && (
                <p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', margin: '0 0 14px 0', background: 'var(--bg3)', padding: '10px 14px', borderRadius: 8 }}>
                  "{req.message}"
                </p>
              )}

              <div style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                ⚠️ <strong>Note:</strong> Accepting will join you to the collaboration room. Full patient record access still requires hospital approval through the existing access request system.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleRespond(req.id, 'Accepted')} disabled={responding === req.id}
                  style={{ padding: '9px 22px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {responding === req.id ? '...' : '✓ Accept'}
                </button>
                <button onClick={() => handleRespond(req.id, 'Declined')} disabled={responding === req.id}
                  style={{ padding: '9px 22px', background: 'var(--rbg)', color: 'var(--red)', border: '1px solid var(--rborder)', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  ✕ Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}