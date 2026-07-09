import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={styles.page}>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          Rare<span style={{ color: 'var(--accent2)' }}>Sync</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#how" style={styles.navLink}>How it works</a>
          <a href="#security" style={styles.navLink}>Security</a>
        </div>
        <div style={styles.navRight}>
          <button onClick={toggleTheme} style={styles.themeBtn}>
            {isDark ? '☀️' : '🌑'}
          </button>
          <button onClick={() => navigate('/login')} style={styles.btnOutline}>
            Login
          </button>
          <button onClick={() => navigate('/login')} style={styles.btnPrimary}>
            Get started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>Built for rare disease management</div>
        <h1 style={styles.heroH1}>
          One platform for<br />
          doctors, patients<br />
          and <span style={{ color: 'var(--accent)' }}>hospitals.</span>
        </h1>
        <p style={styles.heroP}>
          RareSync connects your entire rare disease workflow — patient records,
          diagnoses, access control, and analytics — all in one secure place.
        </p>
        <div style={styles.heroBtns}>
          <button onClick={() => navigate('/login')} style={styles.btnHeroP}>
            Start for free
          </button>
          <button onClick={() => navigate('/login')} style={styles.btnHeroS}>
            See a demo
          </button>
        </div>

        {/* STATS */}
        <div style={styles.statsRow}>
          {[
            { n: '10k+', l: 'Patients managed' },
            { n: '500+', l: 'Hospitals' },
            { n: '1.2k+', l: 'Doctors' },
            { n: '99.9%', l: 'Uptime' },
          ].map((s) => (
            <div key={s.l} style={styles.statItem}>
              <div style={styles.statNum}>{s.n}</div>
              <div style={styles.statLbl}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* DASHBOARD PREVIEW */}
        <div style={styles.dashPreview}>
          <div style={styles.dashTop}>
            <div style={styles.dashLogo}>RareSync</div>
            <div style={styles.dashNav}>
              {['Patients', 'Diseases', 'Access', 'Audit logs'].map((n) => (
                <button key={n} style={styles.dashNavBtn}>{n}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>City Hospital</div>
          </div>
          <div style={styles.dashBody}>
            <div style={styles.sidebar}>
              {['Dashboard', 'Patients', 'Rare diseases', 'Medical records', 'Access requests', 'Audit logs'].map((item, i) => (
                <div key={item} style={{ ...styles.sideItem, ...(i === 0 ? styles.sideItemActive : {}) }}>
                  <div style={styles.sideDot} />
                  {item}
                </div>
              ))}
            </div>
            <div style={styles.dashMain}>
              <div style={styles.dashTitle}>Hospital dashboard</div>
              <div style={styles.dashCards}>
                {[
                  { n: '48', l: 'Total patients', c: 'var(--accent)' },
                  { n: '12', l: 'Doctors', c: 'var(--green)' },
                  { n: '3', l: 'Pending requests', c: 'var(--orange)' },
                ].map((c) => (
                  <div key={c.l} style={styles.dashCard}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c.c }}>{c.n}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{c.l}</div>
                  </div>
                ))}
              </div>
              <div style={styles.dashCharts}>
                <div style={styles.chartBox}>
                  <div style={styles.chartTitle}>Patients per month</div>
                  <div style={styles.barChart}>
                    {[35, 55, 45, 70, 60, 90].map((h, i) => (
                      <div key={i} style={{ ...styles.bar, height: `${h}%`, background: i === 5 ? 'var(--accent2)' : 'var(--accent)' }} />
                    ))}
                  </div>
                </div>
                <div style={styles.chartBox}>
                  <div style={styles.chartTitle}>Records by type</div>
                  {[
                    { l: 'Diagnoses — 14', c: 'var(--red)' },
                    { l: 'Prescriptions — 10', c: 'var(--green)' },
                    { l: 'Treatment notes — 8', c: 'var(--orange)' },
                    { l: 'Visit history — 6', c: 'var(--accent)' },
                  ].map((r) => (
                    <div key={r.l} style={styles.pieRow}>
                      <div style={{ ...styles.pieDot, background: r.c }} />
                      <span style={{ fontSize: 10, color: 'var(--text2)' }}>{r.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.featSection}>
        <div style={styles.sectionTitle}>Everything you need</div>
        <div style={styles.sectionSub}>Purpose-built for rare disease workflows</div>
        <div style={styles.featGrid}>
          {[
            { icon: '👤', title: 'Patient management', desc: 'Add, search, and track patients with full profiles including blood group, contacts, and history.', bg: 'var(--bg4)' },
            { icon: '🧬', title: 'Disease library', desc: 'Browse rare diseases with ICD codes and link them directly to patient profiles.', bg: 'var(--gbg)' },
            { icon: '📋', title: 'Medical records', desc: 'Diagnoses, prescriptions, treatment notes and visit history stored as searchable text.', bg: 'var(--obg)' },
            { icon: '🔐', title: 'Access control', desc: 'Doctors request patient access. Hospitals approve or reject with a full audit trail.', bg: 'var(--rbg)' },
            { icon: '📊', title: 'Analytics', desc: 'Charts for patient growth, record types, disease distribution and access trends.', bg: 'var(--pbg)' },
            { icon: '🔒', title: 'JWT security', desc: 'Role-based access for doctors and hospitals. Every action logged in the audit trail.', bg: 'var(--bg4)' },
          ].map((f) => (
            <div key={f.title} style={styles.featCard}>
              <div style={{ ...styles.featIcon, background: f.bg }}>{f.icon}</div>
              <h3 style={styles.featTitle}>{f.title}</h3>
              <p style={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={styles.howSection}>
        <div style={styles.sectionTitle}>How it works</div>
        <div style={styles.sectionSub}>Get started in minutes</div>
        <div style={styles.steps}>
          {[
            { n: '1', title: 'Register your hospital', desc: 'Create a hospital account and invite your doctors to join.' },
            { n: '2', title: 'Add patients', desc: 'Doctors and hospital staff can add and manage patient profiles.' },
            { n: '3', title: 'Link diseases and records', desc: 'Attach rare diseases and add diagnoses, prescriptions and notes.' },
            { n: '4', title: 'Control access', desc: 'Doctors request access, hospitals approve. Every action is logged.' },
          ].map((s) => (
            <div key={s.n} style={styles.stepCard}>
              <div style={styles.stepNum}>{s.n}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <p style={styles.ctaDesc}>Join hospitals and doctors already using RareSync.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('/login')} style={styles.btnHeroP}>
            Create free account
          </button>
          <button onClick={() => navigate('/login')} style={styles.btnHeroS}>
            Login
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          Rare<span style={{ color: 'var(--accent2)' }}>Sync</span>
        </div>
        <p style={styles.footerText}>
          © 2024 RareSync · Built with Node.js, React and MySQL · All rights reserved
        </p>
      </footer>

    </div>
  );
}

const styles = {
  page: { background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },

  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', height: 60, background: 'var(--topbar)',
    borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { fontSize: 20, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' },
  navLinks: { display: 'flex', gap: 28 },
  navLink: { color: 'var(--text2)', textDecoration: 'none', fontSize: 13 },
  navRight: { display: 'flex', alignItems: 'center', gap: 10 },
  themeBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14,
  },
  btnOutline: {
    padding: '7px 18px', background: 'transparent', border: '1px solid var(--border2)',
    borderRadius: 8, color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontWeight: 600,
  },
  btnPrimary: {
    padding: '7px 18px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700,
  },

  hero: { padding: '60px 40px 40px', textAlign: 'center', background: 'var(--bg)' },
  heroBadge: {
    display: 'inline-block', background: 'var(--bg4)', border: '1px solid var(--border2)',
    color: 'var(--accent)', padding: '4px 16px', borderRadius: 20, fontSize: 12,
    fontWeight: 600, marginBottom: 20,
  },
  heroH1: {
    fontSize: 44, fontWeight: 800, lineHeight: 1.15, marginBottom: 16,
    color: 'var(--text)', letterSpacing: '-1.5px',
  },
  heroP: {
    color: 'var(--text2)', fontSize: 15, maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.8,
  },
  heroBtns: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 36 },
  btnHeroP: {
    padding: '12px 28px', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  btnHeroS: {
    padding: '12px 28px', background: 'var(--bg3)', color: 'var(--text)',
    border: '1px solid var(--border2)', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontWeight: 600,
  },

  statsRow: {
    display: 'flex', justifyContent: 'center',
    border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
    maxWidth: 560, margin: '0 auto 36px',
  },
  statItem: { flex: 1, textAlign: 'center', padding: '16px 8px', borderRight: '1px solid var(--border)' },
  statNum: { fontSize: 22, fontWeight: 800, color: 'var(--accent)' },
  statLbl: { fontSize: 11, color: 'var(--text3)', marginTop: 3 },

  dashPreview: {
    border: '1px solid var(--border)', borderRadius: 16,
    overflow: 'hidden', margin: '0 auto', maxWidth: 780, textAlign: 'left',
  },
  dashTop: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 18px', background: 'var(--topbar)', borderBottom: '1px solid var(--border)',
  },
  dashLogo: { fontWeight: 800, color: 'var(--accent)', fontSize: 13 },
  dashNav: { display: 'flex', gap: 5 },
  dashNavBtn: {
    padding: '4px 10px', borderRadius: 6, border: 'none',
    background: 'var(--bg4)', color: 'var(--accent)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
  },
  dashBody: { display: 'grid', gridTemplateColumns: '160px 1fr' },
  sidebar: { background: 'var(--sidebar)', borderRight: '1px solid var(--border)', padding: '10px 0' },
  sideItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', fontSize: 11, color: 'var(--text2)', cursor: 'pointer' },
  sideItemActive: { background: 'var(--bg4)', color: 'var(--accent)', borderRight: '2px solid var(--accent)', fontWeight: 700 },
  sideDot: { width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 },
  dashMain: { padding: '14px' },
  dashTitle: { fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text)' },
  dashCards: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 },
  dashCard: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' },
  dashCharts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  chartBox: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' },
  chartTitle: { fontSize: 10, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 50 },
  bar: { borderRadius: '3px 3px 0 0', flex: 1 },
  pieRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 },
  pieDot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },

  featSection: { padding: '52px 40px', background: 'var(--bg2)' },
  sectionTitle: { textAlign: 'center', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 },
  sectionSub: { textAlign: 'center', color: 'var(--text2)', fontSize: 13, marginBottom: 28 },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, maxWidth: 900, margin: '0 auto' },
  featCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 18px' },
  featIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 },
  featTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  featDesc: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 },

  howSection: { padding: '52px 40px', background: 'var(--bg)' },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, maxWidth: 900, margin: '0 auto' },
  stepCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 18px', textAlign: 'center' },
  stepNum: {
    width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 800, margin: '0 auto 12px',
  },
  stepTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 },
  stepDesc: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 },

  ctaSection: {
    padding: '52px 40px', background: 'var(--bg4)',
    borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
    textAlign: 'center',
  },
  ctaTitle: { fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 10 },
  ctaDesc: { color: 'var(--text2)', fontSize: 14, marginBottom: 24 },

  footer: {
    padding: '28px 40px', background: 'var(--topbar)',
    borderTop: '1px solid var(--border)', textAlign: 'center',
  },
  footerLogo: { fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 },
  footerText: { color: 'var(--text3)', fontSize: 12 },
};