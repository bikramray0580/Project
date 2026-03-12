// controllers/wasteController.js
const Waste = require('../models/Waste');

exports.createWaste = async (req, res) => {
  try {
    // Accept both new and older field names safely
    const {
      name,
      type,
      quantity,
      location,
      lat,
      lng,
      description,
      title,       // fallback if frontend sent title
      weightKg     // fallback
    } = req.body;

    // Prefer 'name' but fall back to 'title'
    const finalName = (name && name.trim()) ? name.trim() : (title ? String(title).trim() : null);

    if (!finalName) {
      return res.status(400).json({ error: 'Material name is required (name)' });
    }

    const payload = {
      name: finalName,
      type: type || null,
      quantity: quantity || (weightKg ? String(weightKg) : null),
      location: location || null,
      lat: (lat !== undefined && lat !== null && lat !== '') ? parseFloat(lat) : null,
      lng: (lng !== undefined && lng !== null && lng !== '') ? parseFloat(lng) : null,
      description: description || null
    };

    const created = await Waste.create(payload);
    return res.status(201).json({ message: 'Waste created', waste: created });
  } catch (err) {
    console.error('WASTE CREATE ERROR:', err);
    return res.status(500).json({ error: 'Server error while creating waste', detail: err.message });
  }
};

exports.getAllWastes = async (req, res) => {
  try {
    // optionally allow query by type or search
    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.q) {
      // simple search: name or description or location
      const q = `%${req.query.q}%`;
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: q } },
        { description: { [Op.like]: q } },
        { location: { [Op.like]: q } },
      ];
    }

    const wastes = await Waste.findAll({
      where,
      attributes: ['id','name','type','quantity','location','lat','lng','description','createdAt'],
      order: [['createdAt','DESC']]
    });

    return res.json(wastes);
  } catch (err) {
    console.error('getAllWastes error:', err);
    return res.status(500).json({ error: 'Server error fetching wastes', detail: err.message });
  }
};

// (optional) get single waste by id
exports.getWasteById = async (req, res) => {
  try {
    const waste = await Waste.findByPk(req.params.id);
    if (!waste) return res.status(404).json({ error: 'Waste not found' });
    return res.json(waste);
  } catch (err) {
    console.error('getWasteById error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
