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

const TYPE_COLORS = {
  diagnosis: { bg: '#fff0f0', color: '#e53e3e', label: 'Diagnosis' },
  prescription: { bg: '#f0fff4', color: '#22c55e', label: 'Prescription' },
  treatment_note: { bg: '#fffbeb', color: '#d97706', label: 'Treatment Note' },
  visit_history: { bg: '#f0f4ff', color: '#2c7be5', label: 'Visit History' },
};

export default function MedicalRecordsTab({ patientId }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    record_type: 'diagnosis',
    title: '',
    content: '',
    visit_date: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'all'
        ? `/records/patient/${patientId}`
        : `/records/patient/${patientId}?type=${activeTab}`;
      const { data } = await API.get(url);
      setRecords(data);
    } catch (err) {
      setError('Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId, activeTab]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ record_type: 'diagnosis', title: '', content: '', visit_date: '' });
    setEditingRecord(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingRecord) {
        await API.put(`/records/${editingRecord.id}`, {
          title: form.title,
          content: form.content,
          visit_date: form.visit_date,
        });
      } else {
        await API.post('/records', {
          ...form,
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
    setForm({
      record_type: record.record_type,
      title: record.title || '',
      content: record.content,
      visit_date: record.visit_date ? record.visit_date.split('T')[0] : '',
    });
    setEditingRecord(record);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <h3 style={{ margin: 0 }}>Medical Records</h3>
        {user?.role === 'doctor' && (
          <button
            onClick={() => { setShowForm(!showForm); setEditingRecord(null);
              setForm({ record_type: 'diagnosis', title: '', content: '', visit_date: '' }); }}
            style={styles.addBtn}
          >
            {showForm && !editingRecord ? 'Cancel' : '+ Add Record'}
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && user?.role === 'doctor' && (
        <form onSubmit={handleSubmit} style={styles.formBox}>
          <h4 style={{ marginTop: 0 }}>
            {editingRecord ? 'Edit Record' : 'Add New Record'}
          </h4>
          <div style={styles.formGrid}>
            {/* Record Type — only show on add, not edit */}
            {!editingRecord && (
              <select
                style={styles.input}
                name="record_type"
                value={form.record_type}
                onChange={handleChange}
                required
              >
                <option value="diagnosis">Diagnosis</option>
                <option value="prescription">Prescription</option>
                <option value="treatment_note">Treatment Note</option>
                <option value="visit_history">Visit History</option>
              </select>
            )}
            <input
              style={styles.input}
              name="title"
              placeholder="Title (optional)"
              value={form.title}
              onChange={handleChange}
            />
            <input
              style={styles.input}
              name="visit_date"
              type="date"
              value={form.visit_date}
              onChange={handleChange}
            />
          </div>
          <textarea
            style={styles.textarea}
            name="content"
            placeholder="Write detailed notes here..."
            value={form.content}
            onChange={handleChange}
            rows={5}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={styles.saveBtn}>
              {editingRecord ? 'Save Changes' : 'Add Record'}
            </button>
            <button type="button" onClick={resetForm} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {RECORD_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            style={{
              ...styles.filterTab,
              ...(activeTab === t.value ? styles.filterTabActive : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Records List */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading records...</p>
      ) : records.length === 0 ? (
        <p style={{ color: '#999', fontSize: 14 }}>
          No {activeTab === 'all' ? '' : activeTab.replace('_', ' ')} records found.
        </p>
      ) : (
        <div>
          {records.map((r) => {
            const typeStyle = TYPE_COLORS[r.record_type] || {};
            return (
              <div key={r.id} style={styles.recordCard}>
                <div style={styles.recordHeader}>
                  <div style={styles.recordHeaderLeft}>
                    <span style={{ ...styles.typeBadge, background: typeStyle.bg, color: typeStyle.color }}>
                      {typeStyle.label}
                    </span>
                    {r.title && <span style={styles.recordTitle}>{r.title}</span>}
                  </div>
                  <div style={styles.recordHeaderRight}>
                    <span style={styles.recordMeta}>
                      {r.visit_date
                        ? new Date(r.visit_date).toLocaleDateString()
                        : new Date(r.created_at).toLocaleDateString()}
                    </span>
                    {user?.role === 'doctor' && (
                      <>
                        <button onClick={() => handleEdit(r)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(r.id)} style={styles.deleteBtn}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
                <p style={styles.recordContent}>{r.content}</p>
                <p style={styles.recordDoctor}>— Dr. {r.doctor_name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: {
    padding: '8px 16px',
    background: '#2c7be5',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 'bold',
  },
  formBox: {
    background: '#f7f9fc',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    border: '1px solid #dde3f0',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 },
  input: {
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    boxSizing: 'border-box',
    width: '100%',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    boxSizing: 'border-box',
    marginBottom: 12,
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
  },
  error: { color: '#e53e3e', fontSize: 13, marginBottom: 10 },
  saveBtn: {
    padding: '10px 20px',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#fff',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  filterTabs: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterTab: {
    padding: '6px 14px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 13,
    color: '#555',
  },
  filterTabActive: {
    background: '#2c7be5',
    color: '#fff',
    border: '1px solid #2c7be5',
  },
  recordCard: {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recordHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  recordHeaderRight: { display: 'flex', alignItems: 'center', gap: 8 },
  typeBadge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  recordMeta: { fontSize: 12, color: '#999' },
  editBtn: {
    padding: '4px 12px',
    background: '#fff',
    color: '#2c7be5',
    border: '1px solid #2c7be5',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 12,
  },
  deleteBtn: {
    padding: '4px 12px',
    background: '#fff',
    color: '#e53e3e',
    border: '1px solid #e53e3e',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: 12,
  },
  recordContent: { color: '#444', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px 0', whiteSpace: 'pre-wrap' },
  recordDoctor: { color: '#999', fontSize: 12, margin: 0, textAlign: 'right' },
};