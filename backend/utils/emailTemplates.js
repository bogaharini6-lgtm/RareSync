// ─── BASE TEMPLATE ────────────────────────────────────────────
const base = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>RareSync</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #f0f4ff;
      font-family: Arial, sans-serif;
      padding: 32px 16px;
    }

    .wrapper {
      max-width: 560px;
      margin: 0 auto;
    }

    .header {
      background: #2563eb;
      padding: 24px 32px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }

    .header h1 {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .header p {
      color: #bfdbfe;
      font-size: 12px;
      margin-top: 4px;
    }

    .body {
      background: #ffffff;
      padding: 32px;
      border-left: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
    }

    .footer {
      background: #f8faff;
      padding: 16px 32px;
      text-align: center;
      border-radius: 0 0 12px 12px;
      border: 1px solid #e2e8f0;
      border-top: none;
    }

    .footer p {
      color: #94a3b8;
      font-size: 11px;
      line-height: 1.6;
    }

    h2 {
      font-size: 18px;
      color: #0f172a;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #475569;
      line-height: 1.7;
      margin-bottom: 12px;
    }

    .info-box {
      background: #f8faff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      margin: 16px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f0f4ff;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 600;
    }

    .info-value {
      font-size: 13px;
      color: #0f172a;
      font-weight: 600;
    }

    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      margin: 16px 0;
    }

    .btn-green {
      background: #16a34a;
    }

    .btn-red {
      background: #dc2626;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    .badge-green {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .badge-orange {
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fde68a;
    }

    .badge-red {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
  </style>
</head>

<body>
  <div class="wrapper">

    <div class="header">
      <h1>RareSync</h1>
      <p>Rare Disease Management Platform</p>
    </div>

    <div class="body">${content}</div>

    <div class="footer">
      <p>
        This is an automated message from RareSync.<br/>
        Please do not reply to this email.
      </p>

      <p style="margin-top:8px">
        © ${new Date().getFullYear()} RareSync · All rights reserved
      </p>
    </div>

  </div>
</body>
</html>
`;


// ─── 1. NEW ACCESS REQUEST → Hospital ────────────────────────
const newAccessRequest = ({
  hospitalName,
  doctorName,
  doctorSpecialization,
  patientName,
  purpose,
  duration_days,
  requested_info,
  reason,
  requestedAt
}) =>
  base(`
    <h2>New access request received</h2>

    <p>
      Hello <strong>${hospitalName}</strong>,
    </p>

    <p>
      A doctor has submitted a purpose-based access request for a patient record.
    </p>

    <div class="info-box">

      <div class="info-row">
        <span class="info-label">Doctor</span>
        <span class="info-value">Dr. ${doctorName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Specialization</span>
        <span class="info-value">
          ${doctorSpecialization || 'General'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Patient</span>
        <span class="info-value">${patientName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Purpose</span>
        <span class="info-value">${purpose || 'Not specified'}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Requested Duration</span>
        <span class="info-value">${duration_days || 30} days</span>
      </div>

      <div class="info-row">
        <span class="info-label">Requested Information</span>
        <span class="info-value">
          ${requested_info || 'Full medical history'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Reason</span>
        <span class="info-value">
          ${reason || 'Not provided'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Requested at</span>
        <span class="info-value">
          ${requestedAt ? new Date(requestedAt).toLocaleString() : 'Not available'}
        </span>
      </div>

    </div>

    <p>
      Please login to RareSync to approve or reject this request.
    </p>

    <hr class="divider"/>

    <p style="font-size:12px; color:#94a3b8;">
      This request will expire if not acted upon.
    </p>
  `);


// ─── 2. ACCESS APPROVED → Doctor ─────────────────────────────
const accessApproved = ({
  doctorName,
  patientName,
  hospitalName,
  purpose,
  duration_days,
  expires_at,
  approvedAt
}) =>
  base(`
    <h2>Access request approved ✓</h2>

    <p>
      Hello <strong>Dr. ${doctorName}</strong>,
    </p>

    <p>
      Your access request has been
      <span class="badge badge-green">Approved</span>.
    </p>

    <div class="info-box">

      <div class="info-row">
        <span class="info-label">Patient</span>
        <span class="info-value">${patientName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Hospital</span>
        <span class="info-value">${hospitalName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Purpose</span>
        <span class="info-value">
          ${purpose || 'General Access'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Access Duration</span>
        <span class="info-value">
          ${duration_days || 30} days
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Access Granted</span>
        <span class="info-value">
          ${approvedAt ? new Date(approvedAt).toLocaleString() : 'Not available'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Access Expires</span>
        <span class="info-value">
          ${
            expires_at
              ? new Date(expires_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : 'Not set'
          }
        </span>
      </div>

    </div>

    <p>
      You can now view the patient's full medical records until the access expires.
    </p>

    <hr class="divider"/>

    <p style="font-size:12px; color:#94a3b8;">
      Access will automatically expire on
      ${
        expires_at
          ? new Date(expires_at).toLocaleDateString()
          : 'N/A'
      }.
    </p>
  `);


// ─── 3. ACCESS REJECTED → Doctor ─────────────────────────────
const accessRejected = ({
  doctorName,
  patientName,
  hospitalName,
  rejectedAt
}) =>
  base(`
    <h2>Access request rejected</h2>

    <p>
      Hello <strong>Dr. ${doctorName}</strong>,
    </p>

    <p>
      Unfortunately, your request to access the patient record has been
      <span class="badge badge-red">Rejected</span> by the hospital.
    </p>

    <div class="info-box">

      <div class="info-row">
        <span class="info-label">Patient</span>
        <span class="info-value">${patientName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Hospital</span>
        <span class="info-value">${hospitalName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Rejected at</span>
        <span class="info-value">
          ${new Date(rejectedAt).toLocaleString()}
        </span>
      </div>

    </div>

    <p>
      If you believe this was a mistake, please contact the hospital directly
      or submit a new request with a more detailed reason.
    </p>

    <hr class="divider"/>

    <p style="font-size:12px; color:#94a3b8;">
      If you have questions, please contact your hospital administrator.
    </p>
  `);


// ─── 4. PATIENT ADDED → Hospital ─────────────────────────────
const patientAdded = ({
  hospitalName,
  doctorName,
  patientName,
  gender,
  bloodGroup,
  addedAt
}) =>
  base(`
    <h2>New patient added</h2>

    <p>
      Hello <strong>${hospitalName}</strong>,
    </p>

    <p>
      A new patient has been registered in your hospital by one of your doctors.
    </p>

    <div class="info-box">

      <div class="info-row">
        <span class="info-label">Patient name</span>
        <span class="info-value">${patientName}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Gender</span>
        <span class="info-value">
          ${gender || 'Not specified'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Blood group</span>
        <span class="info-value">
          ${bloodGroup || 'Not specified'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Added by</span>
        <span class="info-value">
          Dr. ${doctorName}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Added at</span>
        <span class="info-value">
          ${new Date(addedAt).toLocaleString()}
        </span>
      </div>

    </div>

    <p>
      Login to RareSync to view the full patient profile.
    </p>
  `);


// ─── 5. DOCTOR REGISTERED → Hospital ─────────────────────────
const doctorRegistered = ({
  hospitalName,
  doctorName,
  doctorEmail,
  specialization,
  registeredAt
}) =>
  base(`
    <h2>New doctor registered</h2>

    <p>
      Hello <strong>${hospitalName}</strong>,
    </p>

    <p>
      A new doctor has registered under your hospital on RareSync.
    </p>

    <div class="info-box">

      <div class="info-row">
        <span class="info-label">Name</span>
        <span class="info-value">
          Dr. ${doctorName}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">
          ${doctorEmail}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Specialization</span>
        <span class="info-value">
          ${specialization || 'General'}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Registered at</span>
        <span class="info-value">
          ${new Date(registeredAt).toLocaleString()}
        </span>
      </div>

    </div>

    <p>
      Login to RareSync to manage your doctors and their access.
    </p>
  `);


// ─── 6. WELCOME → New Doctor ─────────────────────────────────
const welcomeDoctor = ({
  doctorName,
  hospitalName,
  email
}) =>
  base(`
    <h2>Welcome to RareSync, Dr. ${doctorName}!</h2>

    <p>
      Your account has been successfully created.
      You are now registered under <strong>${hospitalName}</strong>.
    </p>

    <div class="info-box">

      <div class="info-row">
        <span class="info-label">Name</span>
        <span class="info-value">
          Dr. ${doctorName}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">
          ${email}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Hospital</span>
        <span class="info-value">
          ${hospitalName}
        </span>
      </div>

    </div>

    <p>Here is what you can do on RareSync:</p>

    <ul style="padding-left:20px; color:#475569; font-size:14px; line-height:2">
      <li>View and manage patients in your hospital</li>
      <li>Add diagnoses, prescriptions and treatment notes</li>
      <li>Link patients to rare diseases</li>
      <li>Request access to patients outside your direct care</li>
    </ul>

    <hr class="divider"/>

    <p style="font-size:12px; color:#94a3b8;">
      If you did not create this account, please contact your hospital administrator immediately.
    </p>
  `);


// ─── 7. WELCOME → New Hospital ───────────────────────────────
const welcomeHospital = ({
  hospitalName,
  email
}) =>
  base(`
    <h2>Welcome to RareSync, ${hospitalName}!</h2>

    <p>
      Your hospital account has been successfully created on RareSync.
    </p>

    <div class="info-box">

      <div class="info-row">
        <span class="info-label">Hospital name</span>
        <span class="info-value">
          ${hospitalName}
        </span>
      </div>

      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">
          ${email}
        </span>
      </div>

    </div>

    <p>Here is what you can do on RareSync:</p>

    <ul style="padding-left:20px; color:#475569; font-size:14px; line-height:2">
      <li>Manage all patients in your hospital</li>
      <li>Approve or reject doctor access requests</li>
      <li>View audit logs of all actions</li>
      <li>Monitor analytics on your dashboard</li>
    </ul>

    <p>
      Your next step is to invite doctors to register under your hospital.
    </p>

    <hr class="divider"/>

    <p style="font-size:12px; color:#94a3b8;">
      If you did not create this account, please contact RareSync support immediately.
    </p>
  `);


// ─── EXPORTS ─────────────────────────────────────────────────
module.exports = {
  newAccessRequest,
  accessApproved,
  accessRejected,
  patientAdded,
  doctorRegistered,
  welcomeDoctor,
  welcomeHospital,
};