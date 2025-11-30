const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Tenant = require('../models/Tenant');
const UserFactory = require('../models/User');
const { getTenantConnection } = require('../utils/tenantConnection');
const { sendVerificationEmail } = require('../utils/email');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_default_secret_change_this';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';

// Helper to mask email when returning
function maskEmail(email) {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

// Register hospital
router.post('/register', async (req, res) => {
  const { name, address, contactDetails, adminEmail, phone, licenseNumber } = req.body;
  if (!name || !adminEmail || !licenseNumber) return res.status(400).json({ error: 'name, adminEmail, licenseNumber are required' });
  try {
    // License uniqueness
    const existing = await Tenant.findOne({ licenseNumber });
    if (existing) return res.status(409).json({ error: 'License number already registered' });

    const tenantId = uuidv4();
    // Create verification token
    const verificationToken = jwt.sign({ tenantId }, JWT_SECRET, { expiresIn: '24h' });
    const verificationExpires = new Date(Date.now() + 24*60*60*1000);

    const tenant = new Tenant({ tenantId, name, address, contactDetails, adminEmail, phone, licenseNumber, verificationToken, verificationExpires, status: 'PENDING' });
    await tenant.save();

    // Create per-tenant DB and admin user
    const conn = getTenantConnection(MONGO_URI, tenantId);
    const User = UserFactory(conn);
    const domain = adminEmail.split('@')[1] || 'localhost';
    const username = `admin@${domain}`;
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const user = new User({ username, email: adminEmail, passwordHash, role: 'admin' });
    await user.save();

    const verifyLink = `${req.protocol}://${req.get('host')}/verify?token=${verificationToken}`;
    const { previewUrl } = await sendVerificationEmail(adminEmail, verifyLink, tempPassword);

    return res.status(201).json({
      message: 'Registration successful. Please verify the email address to activate your hospital.',
      tenant: { tenantId, name, status: tenant.status },
      admin: { username, email: maskEmail(adminEmail) },
      emailPreview: previewUrl
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Verify registration (activation)
router.get('/verify', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Missing token');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const tenantId = decoded.tenantId;
    const tenant = await Tenant.findOne({ tenantId, verificationToken: token });
    if (!tenant) return res.status(400).send('Invalid token or tenant not found');
    if (tenant.verificationExpires < new Date()) return res.status(400).send('Token expired');
    // Move status to VERIFIED then ACTIVE
    tenant.status = 'ACTIVE';
    tenant.verificationToken = undefined;
    tenant.verificationExpires = undefined;
    await tenant.save();
    return res.send('Hospital registration verified and activated.');
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(400).send('Invalid or expired token');
  }
});

module.exports = router;
