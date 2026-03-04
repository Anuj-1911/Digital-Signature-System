const crypto = require('crypto');
const Key    = require('../models/Key.model');
const User   = require('../models/User.model');

// ── SAVE KEY PAIR ─────────────────────────────────────────────
exports.saveKeys = async (req, res) => {
  try {
    const { publicKey, encryptedPrivateKey, iv, salt } = req.body;
    const userId = req.user.id;

    if (!publicKey || !encryptedPrivateKey || !iv || !salt) {
      return res.status(400).json({ error: 'All key fields are required' });
    }

    // Generate public key fingerprint (SHA-256 of public key)
    const fingerprint = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest('hex');

    // Save or update key pair
    const keyRecord = await Key.findOneAndUpdate(
      { userId },
      { publicKey, encryptedPrivateKey, iv, salt, publicKeyFingerprint: fingerprint },
      { upsert: true, new: true }
    );

    // Update fingerprint on User model too
    await User.findByIdAndUpdate(userId, {
      publicKey,
      encryptedPrivateKey,
      publicKeyFingerprint: fingerprint
    });

    res.status(201).json({
      message: 'Key pair saved successfully',
      fingerprint,
      expiresAt: keyRecord.expiresAt
    });

  } catch (err) {
    console.error('Save keys error:', err);
    res.status(500).json({ error: 'Failed to save keys' });
  }
};

// ── GET MY KEYS ───────────────────────────────────────────────
exports.getMyKeys = async (req, res) => {
  try {
    const keyRecord = await Key.findOne({ userId: req.user.id });

    if (!keyRecord) {
      return res.status(404).json({ error: 'No keys found. Please generate a key pair.' });
    }

    res.json({
      publicKey:           keyRecord.publicKey,
      encryptedPrivateKey: keyRecord.encryptedPrivateKey,
      iv:                  keyRecord.iv,
      salt:                keyRecord.salt,
      fingerprint:         keyRecord.publicKeyFingerprint,
      algorithm:           keyRecord.algorithm,
      expiresAt:           keyRecord.expiresAt,
      createdAt:           keyRecord.createdAt
    });

  } catch (err) {
    console.error('Get keys error:', err);
    res.status(500).json({ error: 'Failed to fetch keys' });
  }
};

// ── GET PUBLIC KEY BY USER ID (for verification) ──────────────
exports.getPublicKey = async (req, res) => {
  try {
    const keyRecord = await Key.findOne({ userId: req.params.userId });

    if (!keyRecord) {
      return res.status(404).json({ error: 'Public key not found for this user' });
    }

    res.json({
      publicKey:   keyRecord.publicKey,
      fingerprint: keyRecord.publicKeyFingerprint,
      algorithm:   keyRecord.algorithm,
      expiresAt:   keyRecord.expiresAt
    });

  } catch (err) {
    console.error('Get public key error:', err);
    res.status(500).json({ error: 'Failed to fetch public key' });
  }
};

// ── DELETE KEYS ───────────────────────────────────────────────
exports.deleteKeys = async (req, res) => {
  try {
    await Key.findOneAndDelete({ userId: req.user.id });
    await User.findByIdAndUpdate(req.user.id, {
      publicKey: null,
      encryptedPrivateKey: null,
      publicKeyFingerprint: null
    });

    res.json({ message: 'Keys deleted successfully' });

  } catch (err) {
    console.error('Delete keys error:', err);
    res.status(500).json({ error: 'Failed to delete keys' });
  }
};