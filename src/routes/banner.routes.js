const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bannerController = require('../controllers/banner.controller');

// GET all banners
router.get('/', bannerController.getAllBanners);

// GET a single banner by ID
router.get('/:id', bannerController.getBannerById);

// POST create a new banner
router.post('/', auth, bannerController.createBanner);

// PUT update a banner
router.put('/:id', auth, bannerController.updateBanner);

// DELETE a banner
router.delete('/:id', auth, bannerController.deleteBanner);

module.exports = router;
