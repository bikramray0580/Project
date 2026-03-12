// routes/adminControl.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Models (adjust paths if your project structure differs)
const Waste = require('../models/Waste');
const Request = require('../models/Request');
const AdminHistory = require('../models/AdminHistory'); // we will create this model below

// Admin protection middleware using a simple admin key in headers
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'] || '';
  const expected = process.env.ADMIN_KEY || '';
  if (!expected || key !== expected) {
    return res.status(401).json({ error: 'Unauthorized (admin key required)' });
  }
  next();
};

// --- ADMIN: list all waste (with pagination) ---
router.get('/waste', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, q } = req.query;
    const where = q ? {
      [Op.or]: [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { material: { [Op.like]: `%${q}%` } },
      ],
    } : {};
    const offset = (page - 1) * limit;
    const { count, rows } = await Waste.findAndCountAll({ where, limit: +limit, offset, order: [['createdAt', 'DESC']] });
    res.json({ total: count, items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list waste' });
  }
});

// --- ADMIN: update waste item ---
router.put('/waste/:id', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const fields = req.body; // expect JSON with fields to update
    const item = await Waste.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Waste item not found' });

    await item.update(fields);

    // audit
    await AdminHistory.create({
      entity: 'waste',
      entityId: id.toString(),
      action: 'update',
      payload: JSON.stringify(fields)
    });

    res.json({ success: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update waste' });
  }
});

// --- ADMIN: delete waste item ---
router.delete('/waste/:id', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Waste.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Waste item not found' });

    await item.destroy();

    // audit
    await AdminHistory.create({
      entity: 'waste',
      entityId: id.toString(),
      action: 'delete',
      payload: JSON.stringify(item)
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete waste' });
  }
});

// --- ADMIN: list all requests ---
router.get('/request', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, q } = req.query;
    const where = q ? {
      [Op.or]: [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { material: { [Op.like]: `%${q}%` } },
      ],
    } : {};
    const offset = (page - 1) * limit;
    const { count, rows } = await Request.findAndCountAll({ where, limit: +limit, offset, order: [['createdAt', 'DESC']] });
    res.json({ total: count, items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list requests' });
  }
});

// --- ADMIN: update request item ---
router.put('/request/:id', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const fields = req.body;
    const item = await Request.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Request not found' });

    await item.update(fields);

    // audit
    await AdminHistory.create({
      entity: 'request',
      entityId: id.toString(),
      action: 'update',
      payload: JSON.stringify(fields)
    });

    res.json({ success: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// --- ADMIN: delete request item ---
router.delete('/request/:id', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Request.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Request not found' });

    await item.destroy();

    // audit
    await AdminHistory.create({
      entity: 'request',
      entityId: id.toString(),
      action: 'delete',
      payload: JSON.stringify(item)
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// --- ADMIN: change approval status (waste or request) ---
router.post('/:type/:id/approve', adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params; // type = 'waste' or 'request'
    const { approve } = req.body; // boolean
    const Model = type === 'waste' ? Waste : Request;
    const item = await Model.findByPk(id);
    if (!item) return res.status(404).json({ error: `${type} not found` });

    await item.update({ approved: !!approve });

    await AdminHistory.create({
      entity: type,
      entityId: id.toString(),
      action: approve ? 'approve' : 'unapprove',
      payload: JSON.stringify({ approved: !!approve })
    });

    res.json({ success: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change approval status' });
  }
});

// --- ADMIN: view audit/history (most recent first) ---
router.get('/history', adminAuth, async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const { count, rows } = await AdminHistory.findAndCountAll({ limit: +limit, offset, order: [['createdAt', 'DESC']] });
    res.json({ total: count, items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
