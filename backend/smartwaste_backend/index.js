// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const sequelize = require('./config/database');

// ============================
// REGISTER MODELS
// ============================
require('./models/User');
require('./models/Waste');
require('./models/Request');
require('./models/Service');
require('./models/AdminHistory'); // <-- Added correctly

// ============================
// IMPORT ROUTES
// ============================
const authRoutes = require('./routes/auth');
const wasteRoutes = require('./routes/waste');
const requestRoutes = require('./routes/request');
const servicesRoutes = require('./routes/services');
const leaderboardRoutes = require('./routes/leaderboard');
const pointsRoutes = require('./routes/points');
const contactRoutes = require('./routes/contact');
const mapRoutes = require('./routes/map');
const statsRoutes = require('./routes/stats');
const adminControlRoutes = require('./routes/adminControl'); // <-- Added correctly

// ============================
// CREATE APP
// ============================
const app = express();

// ============================
// MIDDLEWARE
// ============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Serving /uploads folder');

// ============================
// API ROUTES
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/stats', statsRoutes);

// admin API added
app.use('/api/admin', adminControlRoutes);
console.log('✅ Admin control routes mounted at /api/admin');

console.log('✅ All API routes mounted');

// ============================
// SERVE FRONTEND (IMPORTANT)
// ============================
const FRONTEND_DIR = path.join(__dirname, '..', 'smartwaste frontend');

// serve static files
app.use('/', express.static(FRONTEND_DIR));
console.log(`✅ Serving FRONTEND from: ${FRONTEND_DIR}`);

// fallback -> index.html
app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ============================
// START SERVER + DB SYNC + DEFAULT USERS
// ============================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ SQLite database connected & synced');

    // ==== Create default admin & user ====
    const bcrypt = require('bcrypt');
    const User = require('./models/User');

    const ADMIN_EMAIL = 'admin@example.com';
    const ADMIN_PW = 'admin123';
    const USER_EMAIL = 'user@example.com';
    const USER_PW = 'user123';

    // CREATE ADMIN
    const admin = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (!admin) {
      await User.create({
        name: 'Administrator',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PW, 10),
        role: 'admin'
      });
      console.log(`✅ Created default admin: ${ADMIN_EMAIL}`);
    }

    // CREATE USER
    const user = await User.findOne({ where: { email: USER_EMAIL } });
    if (!user) {
      await User.create({
        name: 'Demo User',
        email: USER_EMAIL,
        password: await bcrypt.hash(USER_PW, 10),
        role: 'user'
      });
      console.log(`✅ Created default user: ${USER_EMAIL}`);
    }

    // ==== Start server ====
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('\n❌ Failed to sync DB:', err);
    process.exit(1);
  }
})();
