const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');

// GET all banners
router.get('/', bannerController.getAllBanners);

// GET a single banner by ID
router.get('/:id', bannerController.getBannerById);

// POST create a new banner
router.post('/', bannerController.createBanner);

// PUT update a banner
router.put('/:id', bannerController.updateBanner);

// DELETE a banner
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
