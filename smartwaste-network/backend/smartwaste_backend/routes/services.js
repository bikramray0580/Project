// routes/services.js
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// GET all active services (ordered)
router.get('/', async (req, res) => {
  try {
    const list = await Service.findAll({
      where: { active: true },
      order: [['order', 'ASC']]
    });
    res.json(list);
  } catch (err) {
    console.error('GET /api/services error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET single service by id
router.get('/:id', async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json(s);
  } catch (err) {
    console.error('GET /api/services/:id error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Create a new service (no auth here; add middleware in production)
router.post('/', async (req, res) => {
  try {
    const { title, short, long, iconUrl, order = 0, active = true } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: 'title required' });
    const s = await Service.create({ title, short, long, iconUrl, order, active });
    res.status(201).json(s);
  } catch (err) {
    console.error('POST /api/services error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// (Optional) Update service
router.put('/:id', async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ ok: false, error: 'Not found' });
    await s.update(req.body);
    res.json(s);
  } catch (err) {
    console.error('PUT /api/services/:id error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// (Optional) Soft-delete toggle
router.delete('/:id', async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ ok: false, error: 'Not found' });
    await s.update({ active: false });
    res.json({ ok: true, message: 'Service deactivated' });
  } catch (err) {
    console.error('DELETE /api/services/:id error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
