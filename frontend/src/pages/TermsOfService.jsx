import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <div style={{ background: 'var(--topbar)', borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/')}>
          RareSync
        </div>
        <button onClick={() => navigate('/')} style={{ padding: '7px 16px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
          Back to Home
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 32 }}>Last updated: September 2026</p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: 'By registering for or using RareSync, you agree to these Terms of Service. If you do not agree, do not use the platform. These terms apply to all users including doctors and hospital administrators.'
          },
          {
            title: '2. Platform Purpose',
            content: 'RareSync is a healthcare professional platform designed to facilitate the management of rare disease patient records and enable secure cross-hospital collaboration between authorized medical professionals. RareSync is NOT intended for direct patient use and does NOT provide medical advice.'
          },
          {
            title: '3. Eligibility',
            content: 'RareSync is intended for use by: licensed medical doctors and healthcare professionals; hospital administrators and authorized staff. By registering, you confirm that you are a qualified healthcare professional and that the information you provide is accurate.'
          },
          {
            title: '4. User Responsibilities',
            content: 'You agree to: keep your login credentials confidential; use OTP authentication for every login; only access patient records for legitimate medical purposes; not share patient information outside the platform without authorization; report any security concerns immediately; comply with all applicable healthcare data protection laws in your jurisdiction.'
          },
          {
            title: '5. Patient Data',
            content: 'You are responsible for ensuring you have appropriate authorization to access any patient record. The platform enforces access controls but you remain professionally and legally responsible for how you use patient information. Unauthorized access to patient records may violate applicable laws.'
          },
          {
            title: '6. Access Control',
            content: 'Access to patient records requires explicit approval from hospital administrators. Approved access is time-limited and purpose-specific. RareSync logs all access to patient records. Misuse of access privileges may result in account suspension and reporting to relevant authorities.'
          },
          {
            title: '7. Prohibited Use',
            content: 'You must not: use RareSync for non-medical commercial purposes; attempt to access records without authorization; share your account credentials with others; attempt to circumvent security controls; use automated tools to extract patient data; use the platform for research without appropriate ethical approval.'
          },
          {
            title: '8. Limitation of Liability',
            content: 'RareSync is provided as a platform tool for healthcare professionals. We are not responsible for clinical decisions made using information accessed through our platform. Healthcare professionals remain fully responsible for their medical decisions and compliance with professional standards.'
          },
          {
            title: '9. Account Termination',
            content: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in suspicious activity, or misuse patient data. Hospital administrators may deactivate doctor accounts within their organization.'
          },
          {
            title: '10. Changes to Terms',
            content: 'We may update these Terms of Service from time to time. Continued use of RareSync after changes constitutes acceptance of the new terms. We will notify registered users of significant changes by email.'
          },
          {
            title: '11. Contact',
            content: 'For questions about these terms, contact us at: bogaharini6@gmail.com'
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
            These Terms of Service are provided for informational purposes. RareSync has not yet undergone independent legal review. Consult a qualified lawyer before launching RareSync for real users.
          </p>
        </div>
      </div>
    </div>
  );
}
