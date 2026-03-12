const express = require('express');
const router = express.Router();

const User = require('../models/User');

/**
 * GET /api/leaderboard
 * Paginated list of top users by ecoPoints
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const offset = (page - 1) * limit;

    const total = await User.count();

    const users = await User.findAll({
      order: [['ecoPoints', 'DESC'], ['id', 'ASC']],
      limit,
      offset,
      attributes: ['id', 'name', 'email', 'ecoPoints']
    });

    const usersWithRank = users.map((u, idx) => ({
      rank: offset + idx + 1,
      id: u.id,
      name: u.name,
      email: u.email,
      ecoPoints: u.ecoPoints || 0
    }));

    return res.json({
      ok: true,
      data: { total, page, limit, users: usersWithRank }
    });
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * GET /api/leaderboard/user/:id
 * Returns rank + ecoPoints + total users
 */
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const total = await User.count();
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'ecoPoints']
    });

    if (!user)
      return res.status(404).json({ ok: false, error: 'User not found' });

    // Calculate rank (1 + count of users with more ecoPoints)
    const higherCount = await User.count({
      where: { ecoPoints: { [require('sequelize').Op.gt]: user.ecoPoints } }
    });

    const rank = higherCount + 1;

    return res.json({
      ok: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        ecoPoints: user.ecoPoints,
        rank,
        total
      }
    });
  } catch (err) {
    console.error('GET /api/leaderboard/user/:id error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
