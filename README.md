# RareSync

A full-stack web platform for managing rare disease patients.
Built with Node.js, React, and MySQL.

## Tech Stack
- **Backend:** Node.js, Express, MySQL2, JWT, bcryptjs
- **Frontend:** React (Vite), Axios, React Router DOM
- **Database:** MySQL

## Features
- Doctor & Hospital Authentication with JWT
- Role-Based Access Control
- Patient Management (Add, Edit, Delete, Search)
- Rare Disease Management & Patient Linking
- Text-based Medical Records (diagnosis, prescriptions, treatment notes, visit history)
- Access Request System (Doctor requests → Hospital approves/rejects)
- Audit Logs for all actions
- Statistics Dashboard

## Folder Structure
\`\`\`
RareSync/
├── backend/        # Node.js + Express API
├── frontend/       # React App (Vite)
└── README.md
\`\`\`

## Getting Started

### 1. Database
Run `backend/schema.sql` in MySQL Workbench

### 2. Backend
\`\`\`bash
cd backend
npm install
# create .env file (see .env.example)
npm run dev
\`\`\`

### 3. Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`