const express = require('express');
const router = express.Router();
const { Request } = require('../models');
const { ensureAuth } = require('../middleware/auth');

router.get('/requests', async (req, res) => {
  const reqs = await Request.findAll();
  res.json(reqs);
});

router.post('/requests', ensureAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const requesterId = req.session.user.id;
    const r = await Request.create({ title, description, requesterId });
    res.json(r);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

module.exports = router;
