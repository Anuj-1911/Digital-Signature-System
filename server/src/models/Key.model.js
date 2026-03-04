const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  publicKey: {
    type: String,
    required: true
  },
  encryptedPrivateKey: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  publicKeyFingerprint: {
    type: String,
    required: true
  },
  algorithm: {
    type: String,
    default: 'RSA-PSS-SHA256'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  }
}, { timestamps: true });

module.exports = mongoose.model('Key', keySchema);