const express = require('express');
const router = express.Router();
const Waste = require('../models/Waste');
const nodemailer = require('nodemailer');

// EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

transporter.verify(err => {
  if (err) console.log('❌ Waste email transporter error:', err.message);
  else console.log('📨 Waste email system ready');
});

// GET ALL WASTE (for map + stats + dashboards)
router.get('/', async (req, res) => {
  try {
    const wastes = await Waste.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.json({ success: true, wastes });
  } catch (err) {
    console.error('❌ Waste GET error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST WASTE
router.post('/', async (req, res) => {
  try {
    let { name, type, quantity, location, lat, lng, description } = req.body;

    if (!name || !type || !quantity) {
      return res.status(400).json({ success: false, msg: 'Missing required fields' });
    }

    let latNum = null;
    let lngNum = null;
    if (lat !== undefined && lat !== null && lat !== '') {
      const parsed = parseFloat(lat);
      if (!isNaN(parsed)) latNum = parsed;
    }
    if (lng !== undefined && lng !== null && lng !== '') {
      const parsed = parseFloat(lng);
      if (!isNaN(parsed)) lngNum = parsed;
    }

    const waste = await Waste.create({
      name,
      type,
      quantity,
      location,
      lat: latNum,
      lng: lngNum,
      description
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `New Waste Posted: ${name}`,
      text: `A new waste listing has been posted:

Material Name: ${name}
Category: ${type}
Quantity: ${quantity}
Location: ${location || 'Not given'}

Latitude: ${latNum != null ? latNum : 'Not given'}
Longitude: ${lngNum != null ? lngNum : 'Not given'}

Description:
${description || '—'}

SmartWaste Notification`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error('❌ Waste email send error:', mailErr.message);
    }

    return res
      .status(201)
      .json({ success: true, msg: 'Waste posted & email processed', waste });
  } catch (err) {
    console.error('❌ Waste POST error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});
// ==============================
// GET SINGLE WASTE BY ID
// ==============================
router.get('/:id', async (req, res) => {
  try {
    const Waste = require('../models/Waste');
    const item = await Waste.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Waste item not found' });
    }

    res.json(item);

  } catch (err) {
    console.error('Error fetching waste item:', err);
    res.status(500).json({ error: 'Failed to fetch waste item' });
  }
});

module.exports = router;
