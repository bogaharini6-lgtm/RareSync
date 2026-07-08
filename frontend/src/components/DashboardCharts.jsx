import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';

// ─── COLORS ─────────────────────────────────────────────────
const COLORS = ['#2c7be5', '#22c55e', '#d97706', '#e53e3e', '#7c3aed', '#0891b2'];

const RECORD_TYPE_COLORS = {
  diagnosis:      '#e53e3e',
  prescription:   '#22c55e',
  treatment_note: '#d97706',
  visit_history:  '#2c7be5',
};

const RECORD_TYPE_LABELS = {
  diagnosis:      'Diagnoses',
  prescription:   'Prescriptions',
  treatment_note: 'Treatment Notes',
  visit_history:  'Visit History',
};

// ─── RECORDS BY TYPE PIE CHART ───────────────────────────────
export function RecordsByTypeChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No medical records yet" />;
  }

  const chartData = data.map((d) => ({
    name: RECORD_TYPE_LABELS[d.record_type] || d.record_type,
    value: parseInt(d.count),
    color: RECORD_TYPE_COLORS[d.record_type] || '#888',
  }));

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>Medical Records by Type</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── ACCESS REQUESTS STATUS BAR CHART ───────────────────────
export function AccessRequestsChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No access requests yet" />;
  }

  const chartData = [
    { name: 'Pending',  value: data.pending  || 0, color: '#d97706' },
    { name: 'Approved', value: data.approved || 0, color: '#22c55e' },
    { name: 'Rejected', value: data.rejected || 0, color: '#e53e3e' },
  ];

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>Access Requests Status</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── DISEASE DISTRIBUTION BAR CHART ─────────────────────────
export function DiseaseDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No disease data yet" />;
  }

  const chartData = data.map((d, i) => ({
    name: d.disease_name?.length > 15 ? d.disease_name.substring(0, 15) + '...' : d.disease_name,
    patients: parseInt(d.patient_count),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>Disease Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip />
          <Bar dataKey="patients" name="Patients" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── MONTHLY PATIENTS LINE CHART ─────────────────────────────
export function MonthlyPatientsChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No monthly data yet" />;
  }

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>Patients Registered (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            name="Patients"
            stroke="#2c7be5"
            strokeWidth={3}
            dot={{ fill: '#2c7be5', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────
function EmptyChart({ message }) {
  return (
    <div style={styles.chartBox}>
      <div style={styles.emptyChart}>
        <span style={{ fontSize: 32 }}>📊</span>
        <p style={{ color: '#999', margin: '8px 0 0 0', fontSize: 14 }}>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  chartBox: {
    background: '#fff',
    borderRadius: 10,
    padding: '20px 16px',
    border: '1px solid #eee',
  },
  chartTitle: {
    margin: '0 0 16px 0',
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  emptyChart: {
    height: 260,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};