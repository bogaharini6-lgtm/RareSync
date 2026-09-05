import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'var(--topbar)', borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/')}>
          RareSync
        </div>
        <button onClick={() => navigate('/')} style={{ padding: '7px 16px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
          Back to Home
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>Last updated: September 2026</p>

        {[
          {
            title: '1. Introduction',
            content: 'RareSync is a rare disease patient management platform designed for healthcare professionals. We are committed to protecting the privacy and security of all personal and medical data processed through our platform. This Privacy Policy explains how we collect, use, store and protect your information.'
          },
          {
            title: '2. Information We Collect',
            content: 'We collect the following categories of information: (a) Account information including name, email address, professional credentials and hospital affiliation for doctors and hospital administrators. (b) Patient medical information including diagnoses, prescriptions, treatment plans, medical records and visit history — collected only by authorized healthcare professionals. (c) Access logs and audit trails recording who accessed which patient records and when. (d) Usage data including login timestamps and actions performed within the platform.'
          },
          {
            title: '3. How We Use Your Information',
            content: 'We use collected information to: provide the RareSync platform to authorized healthcare professionals; manage access control between doctors and hospitals; send email notifications about access requests and approvals; maintain audit logs for security and compliance; and improve platform performance and security.'
          },
          {
            title: '4. Patient Data Access Control',
            content: 'RareSync implements a strict access control system. Patient medical records are only accessible to: (a) the primary doctor who created the patient record; (b) doctors who have received explicit approval from the hospital administrator; and (c) hospital administrators for their own hospital patients. All other doctors see only limited information — patient name, age, gender, rare disease name and hospital name — until access is approved.'
          },
          {
            title: '5. Data Security',
            content: 'We implement the following security measures: password hashing using bcrypt; JSON Web Token authentication with expiry; OTP-based two-factor authentication for all logins; rate limiting to prevent brute force attacks; input validation and sanitization; audit logging of all sensitive operations; encrypted data transmission using HTTPS in production.'
          },
          {
            title: '6. Data Retention',
            content: 'Patient records are retained for the duration required by applicable healthcare regulations. Deleted patient records are soft-deleted — they are hidden from the interface but retained in the database to preserve medical history. Account data is retained while the account remains active. OTP codes are automatically expired after 10 minutes.'
          },
          {
            title: '7. Your Rights',
            content: 'Depending on your location, you may have rights including: access to your personal data; correction of inaccurate data; deletion of your account and associated data; data portability; and objection to certain processing. To exercise these rights, contact us at the email address below.'
          },
          {
            title: '8. International Data Transfers',
            content: 'RareSync may process data in different geographic locations. By using RareSync, you consent to the transfer of your information to servers which may be located outside your country. We take appropriate measures to ensure data protection regardless of location.'
          },
          {
            title: '9. Compliance',
            content: 'RareSync is designed with awareness of applicable healthcare data protection regulations including the India Digital Personal Data Protection Act (DPDP) 2023, GDPR for European users, and HIPAA principles for US users. Note: RareSync is currently in development. Independent legal and compliance review should be completed before processing real patient data in production.'
          },
          {
            title: '10. Contact Us',
            content: 'For privacy-related questions or to exercise your rights, please contact us at: bogaharini6@gmail.com. We will respond to all legitimate requests within 30 days.'
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
            This Privacy Policy is provided for informational purposes. RareSync is currently in development and has not yet undergone independent legal or compliance review. Do not use RareSync for real patient data until a qualified legal and compliance review has been completed.
          </p>
        </div>
      </div>
    </div>
  );
}
