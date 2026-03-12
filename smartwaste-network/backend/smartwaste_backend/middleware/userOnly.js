// middleware/userOnly.js
module.exports = function (req, res, next) {
  if (!req.user) return res.status(401).json({ ok: false, error: 'Not authenticated' });
  if (req.user.role !== 'user') return res.status(403).json({ ok: false, error: 'User only' });
  next();
};
