// routes/contact.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// =============== transporter ===============
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// verify once on startup
transporter.verify((err, success) => {
  if (err) console.log('❌ Email transporter error:', err && err.message ? err.message : err);
  else console.log('✅ Email transporter verified');
});

// =============== POST route ===============
router.post('/', async (req, res) => {
  try {
    const { company, email, phone, message } = req.body || {};
    console.log('📩 Contact form received:', req.body);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `SmartWaste Demo Request from ${company || email || 'Unknown'}`,
      text: `Company/Name: ${company || '—'}\nEmail: ${email || '—'}\nPhone: ${phone || '—'}\n\nMessage:\n${message || '—'}`
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent for contact:', { company, email, phone });
    return res.json({ success: true, msg: 'Email sent successfully!' });
  } catch (err) {
    console.error('❌ Email send error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: 'Email sending failed' });
  }
});

// =============== QUICK TEST GET route ===============
router.get('/test', async (req, res) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: 'SmartWaste Email Test',
      text: 'This is a test email from your SmartWaste backend.'
    };
    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent');
    return res.json({ success: true, msg: 'Test email sent' });
  } catch (err) {
    console.error('❌ Test email error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: err && err.message ? err.message : 'Test failed' });
  }
});

module.exports = router;
