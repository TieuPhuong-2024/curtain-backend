const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const auth = require('../middleware/auth');

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  next();
};

// Public read: the shop copy is shown to every visitor anyway
router.get('/', settingController.getAllSettings);

// Protected writes
router.put('/', auth, requireAdmin, settingController.upsertSettings);

module.exports = router;
