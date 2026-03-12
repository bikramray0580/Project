const express = require('express');
const router = express.Router();
const { Waste } = require('../models');
const { ensureAuth } = require('../middleware/auth');

router.get('/wastes', async (req, res) => {
  const wastes = await Waste.findAll();
  res.json(wastes);
});

router.post('/wastes', ensureAuth, async (req, res) => {
  try {
    const { title, description, lat, lng } = req.body;
    const postedBy = req.session.user.id;
    const w = await Waste.create({ title, description, lat, lng, postedBy });
    res.json(w);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create waste' });
  }
});

module.exports = router;
