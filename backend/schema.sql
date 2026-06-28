-- RareSync Database Schema
-- Run this in MySQL Workbench before starting the server

CREATE DATABASE IF NOT EXISTS raresync_db;
USE raresync_db;

-- Hospitals Table
CREATE TABLE hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);

-- Patients Table
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT,
  name VARCHAR(255) NOT NULL,
  dob DATE,
  gender ENUM('Male', 'Female', 'Other'),
  contact VARCHAR(20),
  address TEXT,
  blood_group VARCHAR(5),
  emergency_contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- Rare Diseases Table
CREATE TABLE rare_diseases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  symptoms TEXT,
  treatment_overview TEXT,
  icd_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient Diseases Link Table
CREATE TABLE patient_diseases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  disease_id INT,
  diagnosed_by INT,
  diagnosed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (disease_id) REFERENCES rare_diseases(id) ON DELETE CASCADE,
  FOREIGN KEY (diagnosed_by) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Medical Records Table
CREATE TABLE medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  record_type ENUM('diagnosis', 'prescription', 'treatment_note', 'visit_history') NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  visit_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Access Requests Table
CREATE TABLE access_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  patient_id INT NOT NULL,
  hospital_id INT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  reason TEXT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_type ENUM('doctor', 'hospital') NOT NULL,
  actor_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);