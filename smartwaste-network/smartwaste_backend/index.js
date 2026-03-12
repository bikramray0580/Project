require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const { sequelize, User, Waste, Request } = require('./models');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const requestRoutes = require('./routes/requests');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'smartwastesecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Serve frontend with space in folder name
app.use('/', express.static(path.join(__dirname, '..', 'smartwaste frontend')));

// API routes
app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', requestRoutes);
app.use('/api', statsRoutes);

// fallback for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// DB sync + seed users
(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synced!");

    const bcrypt = require('bcryptjs');
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    await User.create({ name: 'Admin', email: 'admin@example.com', password: adminHash, role: 'admin' });
    await User.create({ name: 'User', email: 'user@example.com', password: userHash, role: 'user' });

    console.log("Seeded admin@example.com/admin123 and user@example.com/user123");

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
      console.log("Open: http://localhost:" + PORT + "/user-login.html");
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
})();
