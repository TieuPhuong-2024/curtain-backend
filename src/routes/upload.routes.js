const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');

// POST upload image from device
router.post('/from-device', uploadController.uploadImage);

// POST upload multiple images from device
router.post('/multiple-from-device', uploadController.uploadMultipleImages);

// POST save image from URL (cloud)
router.post('/from-url', uploadController.saveImageFromUrl);

// POST save multiple image URLs
router.post('/multiple-from-url', uploadController.saveMultipleImageUrls);

// POST upload video file
router.post('/video', uploadController.uploadVideo);

module.exports = router;