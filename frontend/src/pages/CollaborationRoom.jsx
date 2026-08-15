import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const OPINION_TYPES = [
  'Diagnosis Review',
  'Treatment Opinion',
  'Investigation Review',
  'Second Opinion',
  'Medication Review',
];

const INFO_OPTIONS = [
  'Medical History',
  'Diagnosis',
  'Reports / Lab Results',
  'Treatment History',
  'Prescriptions',
  'Visit History',
];

const DURATIONS = [7, 14, 30, 60, 90];

export default function CollaborationRoom() {
  const { patient_id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [specialistRequests, setSpecialistRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  // Specialist request state
  const [specialists, setSpecialists] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [showSpecialistForm, setShowSpecialistForm] = useState(null);
  const [specForm, setSpecForm] = useState({
    opinion_type: '',
    duration_days: 30,
    requested_info: [],
    message: '',
  });
  const [specSuccess, setSpecSuccess] = useState('');
  const [specError, setSpecError] = useState('');
  const [specLoading, setSpecLoading] = useState(false);

  const fetchRoom = async () => {
    try {
      const { data } = await API.get(`/collaboration/patient/${patient_id}`);
      setRoom(data.room);
      setMembers(data.members);
      setMessages(data.messages);
      setSpecialistRequests(data.specialist_requests);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collaboration room.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const { data } = await API.get(`/collaboration/specialists/${patient_id}`);
      setSpecialists(data.specialists);
      setDiseases(data.diseases);
    } catch (err) {
      console.error('Failed to load specialists');
    }
  };

  useEffect(() => {
    fetchRoom();
    fetchSpecialists();
    const interval = setInterval(fetchRoom, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [patient_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const { data } = await API.post(`/collaboration/${room.id}/message`, { message: newMessage });
      setMessages(data.messages);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const toggleInfo = (info) => {
    setSpecForm((prev) => ({
      ...prev,
      requested_info: prev.requested_info.includes(info)
        ? prev.requested_info.filter(i => i !== info)
        : [...prev.requested_info, info],
    }));
  };

  const handleRequestSpecialist = async (specialist) => {
    if (!specForm.opinion_type) return setSpecError('Please select an opinion type.');
    if (specForm.requested_info.length === 0) return setSpecError('Please select information to share.');

    setSpecLoading(true);
    setSpecError('');
    try {
      await API.post(`/collaboration/${room.id}/request-specialist`, {
        specialist_id: specialist.id,
        patient_id: parseInt(patient_id),
        opinion_type: specForm.opinion_type,
        duration_days: specForm.duration_days,
        requested_info: specForm.requested_info.join(', '),
        message: specForm.message,
      });
      setSpecSuccess(`Opinion request sent to Dr. ${specialist.name}.`);
      setShowSpecialistForm(null);
      setSpecForm({ opinion_type: '', duration_days: 30, requested_info: [], message: '' });
      fetchRoom();
    } catch (err) {
      setSpecError(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setSpecLoading(false);
    }
  };

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: 32, color: 'var(--text2)' }}>Loading collaboration room...</div>
    </div>
  );

  if (error) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: 32 }}>
        <p style={{ color: 'var(--red)', marginBottom: 16 }}>{error}</p>
        <button onClick={() => navigate(`/patients/${patient_id}`)}
          style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Back to Patient
        </button>
      </div>
    </div>
  );

  const alreadyRequested = (spec_id) => specialistRequests.some(r => r.specialist_id === spec_id);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px' }}>

        {/* Room Header */}
        <div style={styles.roomHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate(`/patients/${patient_id}`)} style={styles.backBtn}>← Back</button>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                🏥 Case Collaboration Room
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text2)' }}>
                Patient: <strong>{room?.patient_name}</strong> · {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={styles.statusBadge}>🟢 Active</div>
          </div>
        </div>

        {specSuccess && (
          <div style={{ background: 'var(--gbg)', border: '1px solid var(--gborder)', color: 'var(--green)', padding: '10px 16px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
            ✓ {specSuccess}
          </div>
        )}

        <div style={styles.layout}>

          {/* ── LEFT: Chat ── */}
          <div style={styles.chatPanel}>
            {/* Tab bar */}
            <div style={styles.tabBar}>
              {['chat', 'specialists', 'members'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabBtnActive : {}) }}>
                  {tab === 'chat' ? '💬 Discussion' : tab === 'specialists' ? '🧑‍⚕️ Specialists' : '👥 Members'}
                  {tab === 'specialists' && specialistRequests.length > 0 && (
                    <span style={styles.badge}>{specialistRequests.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <>
                <div style={styles.messages}>
                  {messages.length === 0 ? (
                    <div style={styles.emptyChat}>
                      <p style={{ fontSize: 32 }}>💬</p>
                      <p style={{ color: 'var(--text2)', fontWeight: 600 }}>No messages yet</p>
                      <p style={{ color: 'var(--text3)', fontSize: 13 }}>Start the case discussion below</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.doctor_id === user?.id;
                      return (
                        <div key={msg.id} style={{ ...styles.msgWrapper, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                          {!isMe && (
                            <div style={styles.msgAvatar}>{msg.doctor_name?.charAt(0).toUpperCase()}</div>
                          )}
                          <div style={{ maxWidth: '70%' }}>
                            {!isMe && (
                              <p style={styles.msgName}>Dr. {msg.doctor_name} · {msg.specialization || 'General'}</p>
                            )}
                            <div style={{ ...styles.msgBubble, background: isMe ? 'var(--accent)' : 'var(--bg3)', color: isMe ? '#fff' : 'var(--text)' }}>
                              {msg.message}
                            </div>
                            <p style={{ ...styles.msgTime, textAlign: isMe ? 'right' : 'left' }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={styles.msgForm}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={styles.msgInput}
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()} style={styles.sendBtn}>
                    {sending ? '...' : '➤'}
                  </button>
                </form>
              </>
            )}

            {/* Specialists Tab */}
            {activeTab === 'specialists' && (
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>

                {/* Pending specialist requests */}
                {specialistRequests.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={styles.sectionLabel}>Pending Requests</p>
                    {specialistRequests.map((req) => (
                      <div key={req.id} style={styles.specRequestCard}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: 14 }}>
                            Dr. {req.specialist_name}
                            <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}> · {req.specialization}</span>
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0' }}>{req.specialist_hospital}</p>
                          <p style={{ fontSize: 12, color: 'var(--accent)', margin: '4px 0 0 0', fontWeight: 600 }}>
                            Purpose: {req.opinion_type}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: req.status === 'Accepted' ? 'var(--gbg)' : req.status === 'Declined' ? 'var(--rbg)' : 'var(--obg)',
                          color: req.status === 'Accepted' ? 'var(--green)' : req.status === 'Declined' ? 'var(--red)' : 'var(--orange)',
                        }}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Find Specialists */}
                <p style={styles.sectionLabel}>
                  🔍 Find Specialists
                  {diseases.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400, marginLeft: 8 }}>
                      (Recommended for: {diseases.join(', ')})
                    </span>
                  )}
                </p>

                {specialists.map((spec) => {
                  const requested = alreadyRequested(spec.id);
                  const isMember = members.some(m => m.doctor_id === spec.id);
                  return (
                    <div key={spec.id} style={styles.specialistCard}>
                      <div style={styles.specAvatar}>{spec.name?.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Dr. {spec.name}</p>
                        <p style={{ margin: '2px 0', fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{spec.specialization || 'General'}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text3)' }}>🏥 {spec.hospital_name}</p>
                        {spec.relevance > 0 && (
                          <span style={{ fontSize: 10, background: 'var(--gbg)', color: 'var(--green)', padding: '2px 8px', borderRadius: 10, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
                            ⭐ Recommended
                          </span>
                        )}
                      </div>
                      <div>
                        {isMember ? (
                          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ In Room</span>
                        ) : requested ? (
                          <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 700 }}>Requested</span>
                        ) : (
                          <button
                            onClick={() => { setShowSpecialistForm(spec); setSpecError(''); }}
                            style={{ padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Request Opinion
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Specialist request form */}
                {showSpecialistForm && (
                  <div style={styles.specFormOverlay}>
                    <div style={styles.specFormCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                          🧑‍⚕️ Request Opinion from Dr. {showSpecialistForm.name}
                        </h3>
                        <button onClick={() => setShowSpecialistForm(null)}
                          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text3)' }}>✕</button>
                      </div>

                      <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                        <strong>Patient:</strong> {room?.patient_name} &nbsp;·&nbsp;
                        <strong>Specialist:</strong> Dr. {showSpecialistForm.name} ({showSpecialistForm.specialization}) &nbsp;·&nbsp;
                        <strong>Hospital:</strong> {showSpecialistForm.hospital_name}
                      </div>

                      {/* Opinion Type */}
                      <p style={specLabelStyle}>Opinion Type</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                        {OPINION_TYPES.map((t) => (
                          <button key={t} type="button" onClick={() => setSpecForm({ ...specForm, opinion_type: t })}
                            style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', background: specForm.opinion_type === t ? 'var(--accent)' : 'var(--bg3)', color: specForm.opinion_type === t ? '#fff' : 'var(--text2)', borderColor: specForm.opinion_type === t ? 'var(--accent)' : 'var(--border2)' }}>
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Duration */}
                      <p style={specLabelStyle}>Access Duration</p>
                      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
                        {DURATIONS.map((d) => (
                          <button key={d} type="button" onClick={() => setSpecForm({ ...specForm, duration_days: d })}
                            style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', background: specForm.duration_days === d ? 'var(--accent)' : 'var(--bg3)', color: specForm.duration_days === d ? '#fff' : 'var(--text2)', borderColor: specForm.duration_days === d ? 'var(--accent)' : 'var(--border2)' }}>
                            {d} days
                          </button>
                        ))}
                      </div>

                      {/* Requested Info */}
                      <p style={specLabelStyle}>Information to Share</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                        {INFO_OPTIONS.map((info) => (
                          <button key={info} type="button" onClick={() => toggleInfo(info)}
                            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', background: specForm.requested_info.includes(info) ? 'var(--gbg)' : 'var(--bg3)', color: specForm.requested_info.includes(info) ? 'var(--green)' : 'var(--text2)', borderColor: specForm.requested_info.includes(info) ? 'var(--gborder)' : 'var(--border2)' }}>
                            {specForm.requested_info.includes(info) ? '✓ ' : ''}{info}
                          </button>
                        ))}
                      </div>

                      {/* Message */}
                      <p style={specLabelStyle}>Message (optional)</p>
                      <textarea
                        value={specForm.message}
                        onChange={(e) => setSpecForm({ ...specForm, message: e.target.value })}
                        placeholder="Add context for the specialist..."
                        rows={3}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, resize: 'vertical', fontFamily: 'Arial', boxSizing: 'border-box', marginBottom: 14 }}
                      />

                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 14px 0', lineHeight: 1.6 }}>
                        ⚠️ Note: The specialist will receive an access request that requires hospital approval before they can view patient records.
                      </p>

                      {specError && <p style={{ color: 'var(--red)', fontSize: 13, margin: '0 0 10px 0' }}>{specError}</p>}

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => handleRequestSpecialist(showSpecialistForm)} disabled={specLoading}
                          style={{ padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                          {specLoading ? 'Sending...' : 'Send Request'}
                        </button>
                        <button onClick={() => setShowSpecialistForm(null)}
                          style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                <p style={styles.sectionLabel}>Room Members ({members.length})</p>
                {members.map((m) => (
                  <div key={m.id} style={styles.memberCard}>
                    <div style={{ ...styles.specAvatar, background: m.role === 'primary' ? 'var(--accent)' : m.role === 'specialist' ? 'var(--purple)' : 'var(--green)' }}>
                      {m.doctor_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                        Dr. {m.doctor_name}
                        {m.doctor_id === user?.id && <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}> (You)</span>}
                      </p>
                      <p style={{ margin: '2px 0', fontSize: 12, color: 'var(--text2)' }}>{m.specialization || 'General'} · {m.hospital_name}</p>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: m.role === 'primary' ? 'var(--bg4)' : m.role === 'specialist' ? 'var(--pbg)' : 'var(--gbg)', color: m.role === 'primary' ? 'var(--accent)' : m.role === 'specialist' ? 'var(--purple)' : 'var(--green)' }}>
                      {m.role === 'primary' ? 'Primary Doctor' : m.role === 'specialist' ? 'Specialist' : 'Collaborator'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Patient Summary ── */}
          <div style={styles.sidePanel}>
            <div style={styles.sidePanelSection}>
              <p style={styles.sideSectionTitle}>👤 Patient</p>
              <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0', fontSize: 15 }}>{room?.patient_name}</p>
              {diseases.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px 0' }}>Rare Diseases</p>
                  {diseases.map((d) => (
                    <span key={d} style={{ display: 'inline-block', background: 'var(--pbg)', color: 'var(--purple)', border: '1px solid var(--pborder)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, marginRight: 6, marginBottom: 4 }}>
                      🧬 {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.sidePanelSection}>
              <p style={styles.sideSectionTitle}>📊 Room Stats</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Members', value: members.length },
                  { label: 'Messages', value: messages.length },
                  { label: 'Specialists', value: specialistRequests.length },
                  { label: 'Status', value: room?.status || 'Active' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0 0' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.sidePanelSection}>
              <p style={styles.sideSectionTitle}>⚡ Quick Actions</p>
              <button
                onClick={() => { setActiveTab('specialists'); }}
                style={{ width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 8 }}>
                🧑‍⚕️ Request Specialist Opinion
              </button>
              <button
                onClick={() => navigate(`/patients/${patient_id}`)}
                style={{ width: '100%', padding: '10px', background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                📋 View Patient Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const specLabelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px 0' };

const styles = {
  roomHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px', marginBottom: 16 },
  backBtn: { padding: '6px 12px', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  statusBadge: { padding: '5px 12px', background: 'var(--gbg)', color: 'var(--green)', border: '1px solid var(--gborder)', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, height: 'calc(100vh - 220px)' },
  chatPanel: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  tabBar: { display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 4px' },
  tabBtn: { flex: 1, padding: '12px 8px', border: 'none', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabBtnActive: { color: 'var(--accent)', borderBottom: '2px solid var(--accent)' },
  badge: { background: 'var(--red)', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 },
  messages: { flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  emptyChat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  msgWrapper: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgAvatar: { width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 },
  msgName: { fontSize: 11, color: 'var(--text3)', margin: '0 0 3px 0', fontWeight: 600 },
  msgBubble: { padding: '9px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.5 },
  msgTime: { fontSize: 10, color: 'var(--text3)', margin: '3px 0 0 0' },
  msgForm: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)' },
  msgInput: { flex: 1, padding: '9px 14px', borderRadius: 20, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, outline: 'none' },
  sendBtn: { width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sidePanel: { display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' },
  sidePanelSection: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 },
  sideSectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px 0' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px 0' },
  specialistCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 },
  specAvatar: { width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 },
  memberCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 },
  specRequestCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--obg)', border: '1px solid var(--oborder)', borderRadius: 10, marginBottom: 8 },
  specFormOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  specFormCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' },
};