const express         = require('express');
const router          = express.Router();
const keysController  = require('../controllers/keys.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.post('/',                protect, requireRole('signer', 'admin'), keysController.saveKeys);
router.get('/my',               protect, keysController.getMyKeys);
router.get('/public/:userId',   protect, keysController.getPublicKey);
router.delete('/',              protect, requireRole('signer', 'admin'), keysController.deleteKeys);

module.exports = router;