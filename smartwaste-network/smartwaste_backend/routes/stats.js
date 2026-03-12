const express = require('express');
const router = express.Router();
const { Waste, Request } = require('../models');

router.get('/stats', async (req, res) => {
  try {
    const wasteCount = await Waste.count();
    const requestCount = await Request.count();
    res.json({ wasteCount, requestCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
