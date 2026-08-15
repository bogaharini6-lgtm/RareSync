const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');

// ─── CREATE OR GET ROOM FOR PATIENT ──────────────────────────
exports.getOrCreateRoom = async (req, res) => {
  const { patient_id } = req.params;
  const doctor_id = req.user.id;

  try {
    // Check access
    const [patient] = await db.execute('SELECT * FROM patients WHERE id = ?', [patient_id]);
    if (!patient.length) return res.status(404).json({ message: 'Patient not found.' });

    // Check if doctor has access to this patient
    const isPrimary = Number(patient[0].created_by_doctor) === doctor_id;
    const [approved] = await db.execute(
      "SELECT id FROM access_requests WHERE doctor_id = ? AND patient_id = ? AND status = 'Approved' AND (expires_at IS NULL OR expires_at > NOW())",
      [doctor_id, patient_id]
    );
    if (!isPrimary && !approved.length) {
      return res.status(403).json({ message: 'You need access to this patient to open a collaboration room.' });
    }

    // Get existing room or create new one
    let [rooms] = await db.execute(
      'SELECT * FROM collaboration_rooms WHERE patient_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
      [patient_id]
    );

    let room_id;
    if (!rooms.length) {
      const [result] = await db.execute(
        'INSERT INTO collaboration_rooms (patient_id, created_by_doctor, title) VALUES (?, ?, ?)',
        [patient_id, doctor_id, `Case: ${patient[0].name}`]
      );
      room_id = result.insertId;

      // Add creator as primary member
      await db.execute(
        'INSERT INTO collaboration_members (room_id, doctor_id, role) VALUES (?, ?, "primary")',
        [room_id, doctor_id]
      );
    } else {
      room_id = rooms[0].id;

      // Add doctor as member if not already
      const [existing] = await db.execute(
        'SELECT id FROM collaboration_members WHERE room_id = ? AND doctor_id = ?',
        [room_id, doctor_id]
      );
      if (!existing.length) {
        await db.execute(
          'INSERT INTO collaboration_members (room_id, doctor_id, role) VALUES (?, ?, "collaborator")',
          [room_id, doctor_id]
        );
      }
    }

    // Get full room data
    const [roomData] = await db.execute(
      `SELECT cr.*, p.name AS patient_name, p.gender, p.dob,
              d.name AS creator_name
       FROM collaboration_rooms cr
       JOIN patients p ON cr.patient_id = p.id
       JOIN doctors d ON cr.created_by_doctor = d.id
       WHERE cr.id = ?`,
      [room_id]
    );

    // Get members
    const [members] = await db.execute(
      `SELECT cm.*, d.name AS doctor_name, d.specialization, h.name AS hospital_name
       FROM collaboration_members cm
       JOIN doctors d ON cm.doctor_id = d.id
       LEFT JOIN hospitals h ON d.hospital_id = h.id
       WHERE cm.room_id = ?`,
      [room_id]
    );

    // Get messages
    const [messages] = await db.execute(
      `SELECT cm.*, d.name AS doctor_name, d.specialization
       FROM collaboration_messages cm
       JOIN doctors d ON cm.doctor_id = d.id
       WHERE cm.room_id = ?
       ORDER BY cm.created_at ASC`,
      [room_id]
    );

    // Get specialist requests
    const [specialistReqs] = await db.execute(
      `SELECT sr.*, 
              d1.name AS requested_by_name,
              d2.name AS specialist_name, d2.specialization,
              h.name AS specialist_hospital
       FROM specialist_requests sr
       JOIN doctors d1 ON sr.requested_by = d1.id
       JOIN doctors d2 ON sr.specialist_id = d2.id
       LEFT JOIN hospitals h ON d2.hospital_id = h.id
       WHERE sr.room_id = ?
       ORDER BY sr.created_at DESC`,
      [room_id]
    );

    res.json({
      room: roomData[0],
      members,
      messages,
      specialist_requests: specialistReqs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SEND MESSAGE ─────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  const { room_id } = req.params;
  const { message } = req.body;
  const doctor_id = req.user.id;

  if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

  try {
    const [member] = await db.execute(
      'SELECT id FROM collaboration_members WHERE room_id = ? AND doctor_id = ?',
      [room_id, doctor_id]
    );
    if (!member.length) return res.status(403).json({ message: 'You are not a member of this room.' });

    await db.execute(
      'INSERT INTO collaboration_messages (room_id, doctor_id, message) VALUES (?, ?, ?)',
      [room_id, doctor_id, message.trim()]
    );

    // Return updated messages
    const [messages] = await db.execute(
      `SELECT cm.*, d.name AS doctor_name, d.specialization
       FROM collaboration_messages cm
       JOIN doctors d ON cm.doctor_id = d.id
       WHERE cm.room_id = ?
       ORDER BY cm.created_at ASC`,
      [room_id]
    );

    res.json({ message: 'Message sent.', messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── FIND SPECIALISTS ─────────────────────────────────────────
exports.findSpecialists = async (req, res) => {
  const { patient_id } = req.params;
  const doctor_id = req.user.id;

  try {
    // Get patient diseases to recommend relevant specialists
    const [diseases] = await db.execute(
      `SELECT rd.name FROM patient_diseases pd
       JOIN rare_diseases rd ON pd.disease_id = rd.id
       WHERE pd.patient_id = ?`,
      [patient_id]
    );

    // Get all doctors except current doctor and already members
    const [specialists] = await db.execute(
      `SELECT d.id, d.name, d.specialization, d.email,
              h.name AS hospital_name, h.id AS hospital_id
       FROM doctors d
       LEFT JOIN hospitals h ON d.hospital_id = h.id
       WHERE d.id != ?
       ORDER BY d.specialization, d.name`,
      [doctor_id]
    );

    // Add disease relevance score
    const diseaseNames = diseases.map(d => d.name.toLowerCase());
    const specialistsWithScore = specialists.map(s => {
      const spec = (s.specialization || '').toLowerCase();
      let relevance = 0;

      // Score based on disease-specialization match
      if (diseaseNames.some(d => d.includes('wilson') || d.includes('copper')) && spec.includes('hepatol')) relevance += 10;
      if (diseaseNames.some(d => d.includes('gaucher') || d.includes('lipid')) && spec.includes('metabol')) relevance += 10;
      if (diseaseNames.some(d => d.includes('neuro')) && spec.includes('neuro')) relevance += 10;
      if (diseaseNames.some(d => d.includes('cardiac')) && spec.includes('cardio')) relevance += 10;
      if (spec.includes('rare') || spec.includes('genetic')) relevance += 5;

      return { ...s, relevance };
    });

    specialistsWithScore.sort((a, b) => b.relevance - a.relevance);

    res.json({
      specialists: specialistsWithScore,
      diseases: diseases.map(d => d.name),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── REQUEST SPECIALIST OPINION ───────────────────────────────
exports.requestSpecialistOpinion = async (req, res) => {
  const { room_id } = req.params;
  const { specialist_id, opinion_type, message, patient_id, duration_days, requested_info } = req.body;
  const doctor_id = req.user.id;

  try {
    // Check if already requested
    const [existing] = await db.execute(
      "SELECT id FROM specialist_requests WHERE room_id = ? AND specialist_id = ? AND status = 'Pending'",
      [room_id, specialist_id]
    );
    if (existing.length) return res.status(400).json({ message: 'Already requested this specialist.' });

    // Create access request through existing system
    const [patient] = await db.execute(
      'SELECT p.*, h.name AS hospital_name, h.email AS hospital_email FROM patients p JOIN hospitals h ON p.hospital_id = h.id WHERE p.id = ?',
      [patient_id]
    );

    // Create access request
    const [accessResult] = await db.execute(
      `INSERT INTO access_requests (doctor_id, patient_id, hospital_id, reason, purpose, duration_days, requested_info)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [specialist_id, patient_id, patient[0].hospital_id,
        `Specialist opinion requested by Dr. colleague`, opinion_type,
        duration_days || 30, requested_info || 'Medical History, Diagnosis, Treatment History']
    );

    // Create specialist request
    await db.execute(
      `INSERT INTO specialist_requests (room_id, requested_by, specialist_id, patient_id, opinion_type, message, access_request_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [room_id, doctor_id, specialist_id, patient_id, opinion_type, message || '', accessResult.insertId]
    );

    // Get specialist email
    const [specialist] = await db.execute(
      'SELECT d.name, d.email, h.name AS hospital_name FROM doctors d LEFT JOIN hospitals h ON d.hospital_id = h.id WHERE d.id = ?',
      [specialist_id]
    );

    // Get requesting doctor name
    const [requestingDoc] = await db.execute('SELECT name FROM doctors WHERE id = ?', [doctor_id]);

    // Email to specialist
    sendEmail({
      to: specialist[0].email,
      subject: `Specialist opinion requested — ${patient[0].name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <h2 style="color:#2563eb">RareSync — Specialist Opinion Request</h2>
          <p>Hello Dr. <strong>${specialist[0].name}</strong>,</p>
          <p>Dr. <strong>${requestingDoc[0].name}</strong> has requested your specialist opinion on a patient case.</p>
          <div style="background:#f8faff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:16px 0">
            <p><strong>Patient:</strong> ${patient[0].name}</p>
            <p><strong>Hospital:</strong> ${patient[0].hospital_name}</p>
            <p><strong>Opinion Type:</strong> ${opinion_type}</p>
            <p><strong>Requested Information:</strong> ${requested_info || 'Medical History, Diagnosis'}</p>
            <p><strong>Duration:</strong> ${duration_days || 30} days</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          </div>
          <p>Please login to RareSync to <strong>Accept</strong> or <strong>Decline</strong> this request.</p>
          <p style="font-size:12px;color:#94a3b8">Note: Accepting will initiate an access approval request from the hospital. You will only receive information after hospital approval.</p>
        </div>
      `,
    });

    // Email to hospital about the access request
    sendEmail({
      to: patient[0].hospital_email,
      subject: `Specialist access request — Dr. ${specialist[0].name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <h2 style="color:#2563eb">RareSync — Specialist Access Request</h2>
          <p>Hello <strong>${patient[0].hospital_name}</strong>,</p>
          <p>A specialist opinion has been requested for one of your patients.</p>
          <div style="background:#f8faff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:16px 0">
            <p><strong>Patient:</strong> ${patient[0].name}</p>
            <p><strong>Requesting Doctor:</strong> Dr. ${requestingDoc[0].name}</p>
            <p><strong>Specialist:</strong> Dr. ${specialist[0].name} (${specialist[0].hospital_name})</p>
            <p><strong>Purpose:</strong> ${opinion_type}</p>
          </div>
          <p>Please login to RareSync to review and approve or reject this access request.</p>
        </div>
      `,
    });

    res.status(201).json({ message: 'Specialist opinion requested successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SPECIALIST RESPONDS ──────────────────────────────────────
exports.respondToSpecialistRequest = async (req, res) => {
  const { request_id } = req.params;
  const { status } = req.body;
  const doctor_id = req.user.id;

  if (!['Accepted', 'Declined'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Accepted or Declined.' });
  }

  try {
    const [requests] = await db.execute(
      `SELECT sr.*, d.name AS requester_name, d.email AS requester_email,
              p.name AS patient_name
       FROM specialist_requests sr
       JOIN doctors d ON sr.requested_by = d.id
       JOIN patients p ON sr.patient_id = p.id
       WHERE sr.id = ? AND sr.specialist_id = ?`,
      [request_id, doctor_id]
    );

    if (!requests.length) return res.status(404).json({ message: 'Request not found.' });

    const request = requests[0];

    await db.execute(
      'UPDATE specialist_requests SET status = ?, resolved_at = NOW() WHERE id = ?',
      [status, request_id]
    );

    if (status === 'Accepted') {
      // Add specialist to collaboration room
      const [existing] = await db.execute(
        'SELECT id FROM collaboration_members WHERE room_id = ? AND doctor_id = ?',
        [request.room_id, doctor_id]
      );
      if (!existing.length) {
        await db.execute(
          'INSERT INTO collaboration_members (room_id, doctor_id, role) VALUES (?, ?, "specialist")',
          [request.room_id, doctor_id]
        );
      }

      // Send welcome message in room
      const [spec] = await db.execute('SELECT name, specialization FROM doctors WHERE id = ?', [doctor_id]);
      await db.execute(
        'INSERT INTO collaboration_messages (room_id, doctor_id, message) VALUES (?, ?, ?)',
        [request.room_id, doctor_id, `Dr. ${spec[0].name} (${spec[0].specialization}) has joined as a specialist.`]
      );
    }

    // Notify requesting doctor
    sendEmail({
      to: request.requester_email,
      subject: `Specialist ${status.toLowerCase()} your request — ${request.patient_name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
          <h2 style="color:#2563eb">RareSync — Specialist Response</h2>
          <p>Hello Dr. <strong>${request.requester_name}</strong>,</p>
          <p>Your specialist opinion request has been <strong>${status}</strong>.</p>
          <p><strong>Patient:</strong> ${request.patient_name}</p>
          ${status === 'Accepted' ? '<p>The specialist has joined the collaboration room. Hospital approval is still required for full record access.</p>' : '<p>You may request another specialist for this case.</p>'}
        </div>
      `,
    });

    res.json({ message: `Request ${status}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET SPECIALIST REQUESTS FOR LOGGED IN DOCTOR ─────────────
exports.getMySpecialistRequests = async (req, res) => {
  const doctor_id = req.user.id;
  try {
    const [rows] = await db.execute(
      `SELECT sr.*, 
              d.name AS requested_by_name,
              p.name AS patient_name,
              cr.title AS room_title
       FROM specialist_requests sr
       JOIN doctors d ON sr.requested_by = d.id
       JOIN patients p ON sr.patient_id = p.id
       JOIN collaboration_rooms cr ON sr.room_id = cr.id
       WHERE sr.specialist_id = ? AND sr.status = 'Pending'
       ORDER BY sr.created_at DESC`,
      [doctor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET MY COLLABORATION ROOMS ───────────────────────────────
exports.getMyRooms = async (req, res) => {
  const doctor_id = req.user.id;
  try {
    const [rows] = await db.execute(
      `SELECT cr.*, p.name AS patient_name,
              COUNT(DISTINCT cm.doctor_id) AS member_count,
              COUNT(DISTINCT msg.id) AS message_count
       FROM collaboration_rooms cr
       JOIN patients p ON cr.patient_id = p.id
       JOIN collaboration_members cm ON cr.id = cm.room_id
       LEFT JOIN collaboration_messages msg ON cr.id = msg.room_id
       WHERE cm.doctor_id = ?
       GROUP BY cr.id
       ORDER BY cr.created_at DESC`,
      [doctor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};