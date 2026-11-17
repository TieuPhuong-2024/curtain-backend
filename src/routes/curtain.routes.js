const express = require('express');
const router = express.Router();
const curtainController = require('../controllers/curtain.controller');
const auth = require('../middleware/auth');

// Public read-only routes
router.get('/', curtainController.getAllCurtains);
router.get('/:id', curtainController.getCurtainById);

// Protected routes - require authentication
router.post('/', auth, curtainController.createCurtain);
router.put('/:id', auth, curtainController.updateCurtain);
router.delete('/:id', auth, curtainController.deleteCurtain);

module.exports = router;