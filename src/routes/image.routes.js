const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const auth = require('../middleware/auth');

// Public read-only route
router.get('/curtain/:curtainId', imageController.getImagesByCurtainId);

// Protected routes - require authentication
router.post('/curtain/:curtainId', auth, imageController.addImageToCurtain);
router.put('/:imageId', auth, imageController.updateImage);
router.delete('/:imageId', auth, imageController.deleteImage);

module.exports = router;