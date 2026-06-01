const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log('✅ Multi-services activé\n');
});