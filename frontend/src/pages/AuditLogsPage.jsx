import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ACTION_COLORS = {
  patient_created:  { bg: '#f0fff4', color: '#22c55e' },
  patient_updated:  { bg: '#fffbeb', color: '#d97706' },
  patient_deleted:  { bg: '#fff0f0', color: '#e53e3e' },
  record_created:   { bg: '#f0f4ff', color: '#2c7be5' },
  record_updated:   { bg: '#f0f4ff', color: '#2c7be5' },
  record_viewed:    { bg: '#f9f0ff', color: '#7c3aed' },
  access_requested: { bg: '#fffbeb', color: '#d97706' },
  access_approved:  { bg: '#f0fff4', color: '#22c55e' },
  access_rejected:  { bg: '#fff0f0', color: '#e53e3e' },
};

const formatAction = (action) => {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function AuditLogsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/audit');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.actor_name?.toLowerCase().includes(q) ||
      l.actor_type?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <h1 style={styles.logo}>RareSync</h1>
        <div style={styles.topRight}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={() => navigate('/patients')} style={styles.navBtn}>Patients</button>
          <button onClick={() => navigate('/diseases')} style={styles.navBtn}>Diseases</button>
          <button onClick={() => navigate('/access-requests')} style={styles.navBtn}>Access Requests</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ margin: 0 }}>Audit Logs</h2>
            <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0 0' }}>
              Last 100 actions in your hospital
            </p>
          </div>
          <button onClick={fetchLogs} style={styles.refreshBtn}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <StatCard label="Total Actions" value={logs.length} color="#2c7be5" bg="#f0f4ff" />
          <StatCard label="Patients Created" value={logs.filter(l => l.action === 'patient_created').length} color="#22c55e" bg="#f0fff4" />
          <StatCard label="Records Added" value={logs.filter(l => l.action === 'record_created').length} color="#7c3aed" bg="#f9f0ff" />
          <StatCard label="Access Requests" value={logs.filter(l => l.action === 'access_requested').length} color="#d97706" bg="#fffbeb" />
        </div>

        {/* Search */}
        <input
          placeholder="Search by action, name, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        {/* Logs Table */}
        {loading ? (
          <p style={{ color: '#888' }}>Loading logs...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#999' }}>No audit logs found.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Performed By</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Target</th>
                  <th style={styles.th}>Details</th>
                  <th style={styles.th}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, index) => {
                  const ac = ACTION_COLORS[log.action] || { bg: '#f5f5f5', color: '#555' };
                  return (
                    <tr key={log.id} style={{ ...styles.tr, background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={styles.td}>{log.id}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.actionBadge, background: ac.bg, color: ac.color }}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td style={styles.td}>{log.actor_name || '-'}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.roleBadge,
                          background: log.actor_type === 'doctor' ? '#f0f4ff' : '#f9f0ff',
                          color: log.actor_type === 'doctor' ? '#2c7be5' : '#7c3aed',
                        }}>
                          {log.actor_type}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {log.target_type} #{log.target_id}
                      </td>
                      <td style={{ ...styles.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details || '-'}
                      </td>
                      <td style={styles.td}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 8, padding: '14px 20px', textAlign: 'center' }}>
      <p style={{ fontSize: 26, fontWeight: 'bold', color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color, margin: '4px 0 0 0' }}>{label}</p>
    </div>
  );
}

const styles = {
  page: { fontFamily: 'Arial, sans-serif', background: '#f7f9fc', minHeight: '100vh' },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e5e5e5',
  },
  logo: { color: '#2c7be5', margin: 0, fontSize: 22 },
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
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  refreshBtn: {
    padding: '8px 16px', background: '#fff', border: '1px solid #ddd',
    borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#555',
  },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 },
  searchInput: {
    width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd',
    marginBottom: 20, fontSize: 14, boxSizing: 'border-box',
  },
  tableWrap: { overflowX: 'auto', borderRadius: 8, border: '1px solid #eee' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  theadRow: { background: '#f0f4ff' },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, color: '#555', borderBottom: '2px solid #e5e5e5', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '11px 14px', fontSize: 13, color: '#333' },
  actionBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 'bold', whiteSpace: 'nowrap' },
  roleBadge: { padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: '500' },
};