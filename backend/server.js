const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    message: 'RareSync API is running',
    version: '1.0.0',
    status: 'OK',
  });
});

// Routes — will be added from Day 2 onwards
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/patients', require('./routes/patients'));
// app.use('/api/diseases', require('./routes/diseases'));
// app.use('/api/records', require('./routes/records'));
// app.use('/api/access', require('./routes/access'));
// app.use('/api/audit', require('./routes/audit'));
// app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`RareSync server running on http://localhost:${PORT}`);
});