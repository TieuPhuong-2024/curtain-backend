const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');

// Route to get a file by ID
router.get('/:id', fileController.getFileById);

module.exports = router; 