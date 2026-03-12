const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const User = require('../models/User');

/**
 * POST /api/points/award
 * Body: { userId: number, points: number, reason?: string }
 */
router.post('/award', async (req, res) => {
  const { userId, points, reason } = req.body;
  if (!userId || typeof points !== 'number') {
    return res.status(400).json({ ok: false, error: 'userId and numeric points are required' });
  }

  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    user.ecoPoints = (user.ecoPoints || 0) + Math.max(0, Math.round(points));
    await user.save({ transaction: t });

    // safe, simple logging (no tricky escaping)
    console.log('[Points Award] user:' + userId + ' +' + points + ' (reason: ' + (reason || 'n/a') + ')');

    await t.commit();
    return res.json({ ok: true, msg: 'Points awarded', data: { id: user.id, ecoPoints: user.ecoPoints } });
  } catch (err) {
    console.error('POST /api/points/award error:', err);
    try { await t.rollback(); } catch(e) {}
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * POST /api/points/deduct
 * Body: { userId: number, points: number, reason?: string }
 */
router.post('/deduct', async (req, res) => {
  const { userId, points, reason } = req.body;
  if (!userId || typeof points !== 'number') {
    return res.status(400).json({ ok: false, error: 'userId and numeric points are required' });
  }

  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const deduct = Math.max(0, Math.round(points));
    user.ecoPoints = Math.max(0, (user.ecoPoints || 0) - deduct);
    await user.save({ transaction: t });

    console.log('[Points Deduct] user:' + userId + ' -' + deduct + ' (reason: ' + (reason || 'n/a') + ')');

    await t.commit();
    return res.json({ ok: true, msg: 'Points deducted', data: { id: user.id, ecoPoints: user.ecoPoints } });
  } catch (err) {
    console.error('POST /api/points/deduct error:', err);
    try { await t.rollback(); } catch(e) {}
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
