const express = require('express');
const router = express.Router();
const curtainController = require('../controllers/curtain.controller');

// Get all curtains
router.get('/', curtainController.getAllCurtains);

// Get a specific curtain
router.get('/:id', curtainController.getCurtainById);

// Create a new curtain
router.post('/', curtainController.createCurtain);

// Update a curtain
router.put('/:id', curtainController.updateCurtain);

// Delete a curtain
router.delete('/:id', curtainController.deleteCurtain);

module.exports = router; 