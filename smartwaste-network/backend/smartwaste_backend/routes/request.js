// routes/request.js
const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const nodemailer = require('nodemailer');

// --------------------------------------------------
// Email Transporter
// --------------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

transporter.verify(err => {
  if (err) console.log("❌ Request email transporter error:", err.message);
  else console.log("📨 Request email system ready");
});

// --------------------------------------------------
// POST REQUEST (From user-dashboard request form)
// --------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { material, category, requiredQuantity, useCase, items } = req.body;

    if (!material || !category || !requiredQuantity || !useCase) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save request to database
    const created = await Request.create({
      material,
      category,
      requiredQuantity,
      useCase,
      items: JSON.stringify(items || []), // IMPORTANT FIX
      status: "pending"
    });

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `New Material Request: ${material}`,
      text:
`A new material request was submitted:

Material: ${material}
Category: ${category}
Quantity Needed: ${requiredQuantity}

Use Case:
${useCase}

Items Selected:
${(items || []).join(", ")}

SmartWaste Notification`
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      msg: "Request submitted & email sent!",
      request: created
    });

  } catch (err) {
    console.error("❌ Request create error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==============================
// GET SINGLE REQUEST BY ID
// ==============================
router.get('/:id', async (req, res) => {
  try {
    const item = await Request.findByPk(req.params.id);

    if (!item) return res.status(404).json({ error: 'Request not found' });

    res.json(item);

  } catch (err) {
    console.error('Error fetching request item:', err);
    res.status(500).json({ error: 'Failed to fetch request item' });
  }
});

module.exports = router;
