const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const auth = require('../middleware/auth');

// Protected routes - require authentication
router.post('/from-device', auth, uploadController.uploadImage);
router.post('/multiple-from-device', auth, uploadController.uploadMultipleImages);
router.post('/from-url', auth, uploadController.saveImageFromUrl);
router.post('/multiple-from-url', auth, uploadController.saveMultipleImageUrls);
router.post('/video', auth, uploadController.uploadVideo);

module.exports = router;