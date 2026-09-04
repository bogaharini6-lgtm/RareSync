const db = require('../config/db');

// ─── ADD RARE DISEASE ────────────────────────────────────────
exports.addDisease = async (req, res) => {
  const { name, description, symptoms, treatment_overview, icd_code } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Disease name is required.' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO rare_diseases (name, description, symptoms, treatment_overview, icd_code)
       VALUES (?,?,?,?,?)`,
      [name, description, symptoms, treatment_overview, icd_code]
    );
    res.status(201).json({ message: 'Disease added successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// ─── GET ALL DISEASES (with search) ─────────────────────────
exports.getDiseases = async (req, res) => {
  const search = req.query.search || '';
  try {
    const [rows] = await db.execute(
      `SELECT * FROM rare_diseases
       WHERE name LIKE ? OR icd_code LIKE ?
       ORDER BY name ASC`,
      [`%${search}%`, `%${search}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// ─── GET SINGLE DISEASE ──────────────────────────────────────
exports.getDiseaseById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM rare_diseases WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Disease not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// ─── UPDATE DISEASE ──────────────────────────────────────────
exports.updateDisease = async (req, res) => {
  const { name, description, symptoms, treatment_overview, icd_code } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Disease name is required.' });
  }

  try {
    await db.execute(
      `UPDATE rare_diseases
       SET name=?, description=?, symptoms=?, treatment_overview=?, icd_code=?
       WHERE id=?`,
      [name, description, symptoms, treatment_overview, icd_code, req.params.id]
    );
    res.json({ message: 'Disease updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// ─── LINK PATIENT TO DISEASE ─────────────────────────────────
exports.linkPatientToDisease = async (req, res) => {
  const { patient_id, disease_id, notes } = req.body;
  const diagnosed_by = req.user.id;

  if (!patient_id || !disease_id) {
    return res.status(400).json({ message: 'Patient and disease are required.' });
  }

  try {
    // Check if already linked
    const [existing] = await db.execute(
      'SELECT id FROM patient_diseases WHERE patient_id = ? AND disease_id = ?',
      [patient_id, disease_id]
    );
    if (existing.length) {
      return res.status(400).json({ message: 'Patient already linked to this disease.' });
    }

    await db.execute(
      `INSERT INTO patient_diseases (patient_id, disease_id, diagnosed_by, notes)
       VALUES (?,?,?,?)`,
      [patient_id, disease_id, diagnosed_by, notes || '']
    );
    res.status(201).json({ message: 'Patient linked to disease successfully.' });
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// ─── GET DISEASES FOR A PATIENT ──────────────────────────────
exports.getPatientDiseases = async (req, res) => {
  const patient_id = req.params.patient_id;
  const user = req.user;

  try {
    // For doctors — check access
    if (user.role === 'doctor') {
      const [patient] = await db.execute(
        'SELECT created_by_doctor FROM patients WHERE id = ?',
        [patient_id]
      );

      const isPrimary = patient.length > 0 && Number(patient[0].created_by_doctor) === Number(user.id);

      if (!isPrimary) {
        const [ownRec] = await db.execute(
          'SELECT id FROM medical_records WHERE patient_id = ? AND doctor_id = ? LIMIT 1',
          [patient_id, user.id]
        );
        const [approved] = await db.execute(
          "SELECT id FROM access_requests WHERE doctor_id = ? AND patient_id = ? AND status = 'Approved'",
          [user.id, patient_id]
        );

        if (ownRec.length === 0 && approved.length === 0) {
          return res.json([]); // return empty instead of error
        }
      }
    }

    const [rows] = await db.execute(
      `SELECT pd.*, rd.name AS disease_name, rd.icd_code, rd.description,
              d.name AS doctor_name
       FROM patient_diseases pd
       JOIN rare_diseases rd ON pd.disease_id = rd.id
       JOIN doctors d ON pd.diagnosed_by = d.id
       WHERE pd.patient_id = ?
       ORDER BY pd.diagnosed_at DESC`,
      [patient_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// ─── REMOVE DISEASE LINK FROM PATIENT ───────────────────────
exports.unlinkPatientDisease = async (req, res) => {
  try {
    await db.execute('DELETE FROM patient_diseases WHERE id = ?', [req.params.id]);
    res.json({ message: 'Disease unlinked from patient.' });
  } catch (err) {
    res.status(500).json({ message: "An internal server error occurred." });
  }
};