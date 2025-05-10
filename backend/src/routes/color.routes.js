const express = require('express');
const router = express.Router();
const colorController = require('../controllers/color.controller');

// GET all colors
router.get('/', colorController.getAllColors);

// POST a new color (optional, if you want to manage colors via API)
router.post('/', colorController.createColor);

// GET a color by ID
router.get('/:id', colorController.getColorById);

// PUT (update) a color
router.put('/:id', colorController.updateColor);

// Add other routes for DELETE as needed

module.exports = router;
