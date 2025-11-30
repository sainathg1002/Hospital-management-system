const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  contactDetails: { type: String },
  adminEmail: { type: String, required: true },
  phone: { type: String },
  licenseNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['PENDING','VERIFIED','ACTIVE','SUSPENDED','INACTIVE'], default: 'PENDING' },
  verificationToken: { type: String },
  verificationExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', TenantSchema);
