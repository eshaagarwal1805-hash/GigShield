const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/gigs',         require('./routes/gigs'));
app.use('/api/safety',       require('./routes/safety'));

// Employer / Jobs Routes
app.use('/api/employer',     require('./routes/employer'));

// Phase 2 Routes (uncomment when ready)
// app.use('/api/alerts',       require('./routes/alerts'));
// app.use('/api/transactions', require('./routes/transactions'));

app.get('/', (req, res) => res.send('GigShield API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));