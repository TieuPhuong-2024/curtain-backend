const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const colorController = require('../controllers/color.controller');

// GET all colors
router.get('/', colorController.getAllColors);

// POST a new color (optional, if you want to manage colors via API)
router.post('/', auth, colorController.createColor);

// GET a color by ID
router.get('/:id', colorController.getColorById);

// PUT (update) a color
router.put('/:id', auth, colorController.updateColor);

// Add other routes for DELETE as needed

module.exports = router;
