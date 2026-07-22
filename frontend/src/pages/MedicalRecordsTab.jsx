import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const RECORD_TYPES = [
  { value: 'all', label: 'All Records' },
  { value: 'diagnosis', label: 'Diagnoses' },
  { value: 'prescription', label: 'Prescriptions' },
  { value: 'treatment_note', label: 'Treatment Notes' },
  { value: 'visit_history', label: 'Visit History' },
];

const TYPE_CONFIG = {
  diagnosis: {
    label: 'Diagnosis',
    color: 'var(--red)',
    bg: 'var(--rbg)',
    border: 'var(--rborder)',
    icon: '🔬',
  },
  prescription: {
    label: 'Prescription',
    color: 'var(--green)',
    bg: 'var(--gbg)',
    border: 'var(--gborder)',
    icon: '💊',
  },
  treatment_note: {
    label: 'Treatment Note',
    color: 'var(--orange)',
    bg: 'var(--obg)',
    border: 'var(--oborder)',
    icon: '📋',
  },
  visit_history: {
    label: 'Visit History',
    color: 'var(--accent)',
    bg: 'var(--bg4)',
    border: 'var(--border2)',
    icon: '🏥',
  },
};
   export default function MedicalRecordsTab({ patientId, patientDiseases = [], accessLevel = 'full' }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    record_type: 'diagnosis',
    title: '',
    content: '',
    visit_date: '',
    symptoms: '',
    prescription: '',
    treatment_plan: '',
    doctor_notes: '',
  });

  const fetchRecords = async () => {
  // Don't even try to fetch if we know access is limited
  if (accessLevel === 'limited') {
    setAccessDenied(true);
    setLoading(false);
    return;
  }
  setLoading(true);
  setAccessDenied(false);
  try {
    const url = activeTab === 'all'
      ? `/records/patient/${patientId}`
      : `/records/patient/${patientId}?type=${activeTab}`;
    const { data } = await API.get(url);
    setRecords(data);
  } catch (err) {
    if (err.response?.status === 403) {
      setAccessDenied(true);
    } else {
      setError('Failed to load records.');
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchRecords();
}, [patientId, activeTab, accessLevel]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      record_type: 'diagnosis',
      title: '',
      content: '',
      visit_date: '',
      symptoms: '',
      prescription: '',
      treatment_plan: '',
      doctor_notes: '',
    });
    setEditingRecord(null);
    setShowForm(false);
    setError('');
  };

  // Build content JSON from form fields
  const buildContent = (f) => {
    return JSON.stringify({
      main: f.content,
      symptoms: f.symptoms,
      prescription: f.prescription,
      treatment_plan: f.treatment_plan,
      doctor_notes: f.doctor_notes,
    });
  };

  // Parse content — handle both plain text and JSON
  const parseContent = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    } catch (e) {}
    return { main: raw };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const content = buildContent(form);
      if (editingRecord) {
        await API.put(`/records/${editingRecord.id}`, {
          title: form.title,
          content,
          visit_date: form.visit_date,
        });
      } else {
        await API.post('/records', {
          record_type: form.record_type,
          title: form.title,
          content,
          visit_date: form.visit_date,
          patient_id: patientId,
        });
      }
      resetForm();
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record.');
    }
  };

  const handleEdit = (record) => {
    const parsed = parseContent(record.content);
    setForm({
      record_type: record.record_type,
      title: record.title || '',
      content: parsed.main || record.content,
      visit_date: record.visit_date ? record.visit_date.split('T')[0] : '',
      symptoms: parsed.symptoms || '',
      prescription: parsed.prescription || '',
      treatment_plan: parsed.treatment_plan || '',
      doctor_notes: parsed.doctor_notes || '',
    });
    setEditingRecord(record);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      await API.delete(`/records/${id}`);
      fetchRecords();
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group visit history records by date for timeline
  const visitHistories = records.filter((r) => r.record_type === 'visit_history');
  const otherRecords = records.filter((r) => r.record_type !== 'visit_history' || activeTab !== 'all');

  const displayRecords = activeTab === 'all'
    ? records.filter((r) => r.record_type !== 'visit_history')
    : records;

  if (accessDenied) {
    return (
      <div style={styles.accessDenied}>
        <span style={{ fontSize: 32 }}>🔒</span>
        <p style={{ color: 'var(--orange)', fontWeight: 700, margin: '8px 0 4px' }}>
          Access required
        </p>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          Request and receive hospital approval to view medical records.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Medical Records</h3>
        {user?.role === 'doctor' && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingRecord(null);
              setForm({ record_type: 'diagnosis', title: '', content: '', visit_date: '', symptoms: '', prescription: '', treatment_plan: '', doctor_notes: '' });
            }}
            style={styles.addBtn}
          >
            {showForm && !editingRecord ? 'Cancel' : '+ Add Record'}
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && user?.role === 'doctor' && (
        <form onSubmit={handleSubmit} style={styles.formBox}>
          <h4 style={{ marginTop: 0, color: 'var(--text)', marginBottom: 16 }}>
            {editingRecord ? 'Edit Record' : 'Add New Medical Record'}
          </h4>

          <div style={styles.formGrid2}>
            {!editingRecord && (
              <div style={styles.formField}>
                <label style={styles.label}>Record Type</label>
                <select style={styles.input} name="record_type" value={form.record_type} onChange={handleChange} required>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="prescription">Prescription</option>
                  <option value="treatment_note">Treatment Note</option>
                  <option value="visit_history">Visit History</option>
                </select>
              </div>
            )}
            <div style={styles.formField}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} name="title" placeholder="e.g. Initial Diagnosis, Follow-up" value={form.title} onChange={handleChange} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Visit Date</label>
              <input style={styles.input} name="visit_date" type="date" value={form.visit_date} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>
              {form.record_type === 'diagnosis' ? 'Diagnosis Details' :
               form.record_type === 'prescription' ? 'Prescription Details' :
               form.record_type === 'treatment_note' ? 'Treatment Details' : 'Visit Summary'} *
            </label>
            <textarea style={styles.textarea} name="content" placeholder="Write detailed notes here..." value={form.content} onChange={handleChange} rows={4} required />
          </div>

          {/* Extra fields for diagnosis */}
          {(form.record_type === 'diagnosis' || form.record_type === 'treatment_note') && (
            <div style={styles.formField}>
              <label style={styles.label}>Symptoms</label>
              <textarea style={styles.textarea} name="symptoms" placeholder="e.g. Fatigue, jaundice, abdominal pain" value={form.symptoms} onChange={handleChange} rows={2} />
            </div>
          )}

          {(form.record_type === 'diagnosis' || form.record_type === 'prescription') && (
            <div style={styles.formField}>
              <label style={styles.label}>Prescription / Medications</label>
              <textarea style={styles.textarea} name="prescription" placeholder="e.g. Zinc acetate 50mg twice daily, Vitamin D supplements" value={form.prescription} onChange={handleChange} rows={2} />
            </div>
          )}

          {(form.record_type === 'diagnosis' || form.record_type === 'treatment_note') && (
            <div style={styles.formField}>
              <label style={styles.label}>Treatment Plan</label>
              <textarea style={styles.textarea} name="treatment_plan" placeholder="e.g. Regular monitoring, liver function tests every 3 months" value={form.treatment_plan} onChange={handleChange} rows={2} />
            </div>
          )}

          <div style={styles.formField}>
            <label style={styles.label}>Doctor Notes</label>
            <textarea style={styles.textarea} name="doctor_notes" placeholder="e.g. Follow-up required after 30 days" value={form.doctor_notes} onChange={handleChange} rows={2} />
          </div>

          {error && <p style={styles.error}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" style={styles.saveBtn}>
              {editingRecord ? 'Save Changes' : 'Add Record'}
            </button>
            <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {RECORD_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            style={{ ...styles.filterTab, ...(activeTab === t.value ? styles.filterTabActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Loading records...</p>
      ) : records.length === 0 ? (
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>
          No {activeTab === 'all' ? '' : activeTab.replace('_', ' ')} records found.
        </p>
      ) : (
        <>
          {/* MAIN RECORDS — Diagnosis, Prescription, Treatment */}
          {displayRecords.map((r) => {
            const cfg = TYPE_CONFIG[r.record_type] || TYPE_CONFIG.diagnosis;
            const parsed = parseContent(r.content);
            const isExpanded = expandedId === r.id;

            return (
              <div key={r.id} style={{ ...styles.recordCard, borderLeft: `4px solid ${cfg.color}` }}>
                {/* Record Header */}
                <div style={styles.recordHeader}>
                  <div style={styles.recordHeaderLeft}>
                    <span style={styles.recordIcon}>{cfg.icon}</span>
                    <div>
                      <span style={{ ...styles.typeBadge, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                      {r.title && <span style={styles.recordTitle}>{r.title}</span>}
                    </div>
                  </div>
                  <div style={styles.recordHeaderRight}>
                    <span style={styles.recordDate}>
                      {r.visit_date
                        ? new Date(r.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                        : new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => toggleExpand(r.id)} style={styles.expandBtn}>
                      {isExpanded ? '▲ Collapse' : '▼ View Details'}
                    </button>
                    {user?.role === 'doctor' && (
                      <>
                        <button onClick={() => handleEdit(r)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(r.id)} style={styles.deleteBtn}>Delete</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Always visible — main content */}
                <p style={styles.recordMainContent}>{parsed.main || r.content}</p>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={styles.expandedBox}>

                    {parsed.symptoms && (
                      <InfoBlock
                        icon="🩺"
                        label="Symptoms"
                        value={parsed.symptoms}
                        color={cfg.color}
                      />
                    )}

                    {parsed.prescription && (
                      <InfoBlock
                        icon="💊"
                        label="Prescription / Medications"
                        value={parsed.prescription}
                        color="var(--green)"
                      />
                    )}

                    {parsed.treatment_plan && (
                      <InfoBlock
                        icon="🗂️"
                        label="Treatment Plan"
                        value={parsed.treatment_plan}
                        color="var(--orange)"
                      />
                    )}

                    {parsed.doctor_notes && (
                      <InfoBlock
                        icon="📝"
                        label="Doctor Notes"
                        value={parsed.doctor_notes}
                        color="var(--accent2)"
                      />
                    )}

                    <div style={styles.recordMeta}>
                      <MetaItem label="Record created" value={new Date(r.created_at).toLocaleString('en-IN')} />
                      <MetaItem label="Doctor" value={`Dr. ${r.doctor_name}`} />
                      {r.visit_date && (
                        <MetaItem label="Visit date" value={new Date(r.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* VISIT HISTORY TIMELINE — only in 'all' and 'visit_history' tabs */}
          {(activeTab === 'all' || activeTab === 'visit_history') && visitHistories.length > 0 && (
            <div style={styles.timelineSection}>
              <h4 style={styles.timelineTitle}>🏥 Visit History Timeline</h4>
              <div style={styles.timeline}>
                {visitHistories.map((r, i) => {
                  const parsed = parseContent(r.content);
                  const isExpanded = expandedId === `vh-${r.id}`;
                  return (
                    <div key={r.id} style={styles.timelineItem}>
                      <div style={styles.timelineLine}>
                        <div style={styles.timelineDot} />
                        {i < visitHistories.length - 1 && <div style={styles.timelineConnector} />}
                      </div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineHeader}>
                          <div>
                            <p style={styles.timelineDate}>
                              {r.visit_date
                                ? new Date(r.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                : new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            {r.title && <p style={styles.timelineLabel}>{r.title}</p>}
                          </div>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : `vh-${r.id}`)}
                            style={styles.expandBtn}
                          >
                            {isExpanded ? '▲ Less' : '▼ More'}
                          </button>
                        </div>

                        <p style={styles.timelineSummary}>{parsed.main || r.content}</p>

                        {isExpanded && (
                          <div style={styles.timelineDetails}>
                            {parsed.doctor_notes && (
                              <InfoBlock icon="📝" label="Doctor Notes" value={parsed.doctor_notes} color="var(--accent)" />
                            )}
                            {parsed.prescription && (
                              <InfoBlock icon="💊" label="Prescription" value={parsed.prescription} color="var(--green)" />
                            )}
                            <div style={styles.recordMeta}>
                              <MetaItem label="Doctor" value={`Dr. ${r.doctor_name}`} />
                              <MetaItem label="Record created" value={new Date(r.created_at).toLocaleString('en-IN')} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InfoBlock({ icon, label, value, color }) {
  return (
    <div style={{ ...styles.infoBlock, borderLeft: `3px solid ${color}` }}>
      <p style={{ ...styles.infoLabel, color }}>
        {icon} {label}
      </p>
      <p style={styles.infoValue}>{value}</p>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={styles.metaItem}>
      <span style={styles.metaLabel}>{label}</span>
      <span style={styles.metaValue}>{value}</span>
    </div>
  );
}

const styles = {
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 },
  addBtn: {
    padding: '8px 16px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  },
  accessDenied: {
    textAlign: 'center', padding: '32px 20px',
    background: 'var(--obg)', border: '1px solid var(--oborder)',
    borderRadius: 12,
  },
  formBox: {
    background: 'var(--bg3)', padding: 20, borderRadius: 10,
    marginBottom: 20, border: '1px solid var(--border2)',
  },
  formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 },
  formField: { marginBottom: 12 },
  label: { display: 'block', fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border2)', fontSize: 13,
    background: 'var(--bg2)', color: 'var(--text)', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border2)', fontSize: 13,
    background: 'var(--bg2)', color: 'var(--text)', boxSizing: 'border-box',
    resize: 'vertical', fontFamily: 'Arial, sans-serif', lineHeight: 1.6,
  },
  error: { color: 'var(--red)', fontSize: 13, marginBottom: 8 },
  saveBtn: {
    padding: '9px 20px', background: 'var(--green)', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  },
  cancelBtn: {
    padding: '9px 20px', background: 'transparent', color: 'var(--text2)',
    border: '1px solid var(--border2)', borderRadius: 8, cursor: 'pointer', fontSize: 13,
  },
  filterTabs: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  filterTab: {
    padding: '6px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 20, cursor: 'pointer', fontSize: 12, color: 'var(--text2)', fontWeight: 600,
  },
  filterTabActive: { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },

  recordCard: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: 16, marginBottom: 12,
  },
  recordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 },
  recordHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  recordHeaderRight: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  recordIcon: { fontSize: 20, flexShrink: 0 },
  typeBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, marginRight: 6 },
  recordTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginLeft: 4 },
  recordDate: { fontSize: 12, color: 'var(--text3)' },
  expandBtn: {
    padding: '4px 10px', background: 'var(--bg4)', color: 'var(--accent)',
    border: '1px solid var(--border2)', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600,
  },
  editBtn: {
    padding: '4px 10px', background: 'transparent', color: 'var(--accent)',
    border: '1px solid var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 11,
  },
  deleteBtn: {
    padding: '4px 10px', background: 'transparent', color: 'var(--red)',
    border: '1px solid var(--red)', borderRadius: 6, cursor: 'pointer', fontSize: 11,
  },
  recordMainContent: { color: 'var(--text)', fontSize: 13, lineHeight: 1.7, margin: 0 },

  expandedBox: {
    marginTop: 14, paddingTop: 14,
    borderTop: '1px dashed var(--border2)',
  },
  infoBlock: {
    padding: '10px 14px', borderRadius: 8,
    background: 'var(--bg3)', marginBottom: 10,
  },
  infoLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 5px 0' },
  infoValue: { color: 'var(--text)', fontSize: 13, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' },

  recordMeta: {
    display: 'flex', gap: 20, flexWrap: 'wrap',
    marginTop: 12, paddingTop: 10,
    borderTop: '1px solid var(--border)',
  },
  metaItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  metaLabel: { fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 12, color: 'var(--text2)', fontWeight: 600 },

  timelineSection: {
    marginTop: 20, paddingTop: 16,
    borderTop: '1px solid var(--border)',
  },
  timelineTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 },
  timeline: { paddingLeft: 8 },
  timelineItem: { display: 'flex', gap: 16, marginBottom: 0 },
  timelineLine: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
  timelineDot: {
    width: 12, height: 12, borderRadius: '50%',
    background: 'var(--accent)', border: '2px solid var(--bg2)',
    flexShrink: 0, marginTop: 4,
  },
  timelineConnector: { width: 2, flex: 1, background: 'var(--border2)', minHeight: 24, margin: '4px 0' },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  timelineDate: { fontSize: 13, fontWeight: 700, color: 'var(--accent)', margin: 0 },
  timelineLabel: { fontSize: 12, color: 'var(--text2)', margin: '2px 0 0 0' },
  timelineSummary: { fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 },
  timelineDetails: { marginTop: 12 },
};