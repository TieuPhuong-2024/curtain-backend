const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const auth = require('../middleware/auth');

// Get all favorites for the logged-in user
router.get('/', auth, favoriteController.getFavorites);

// Get favorites by user ID
router.get('/user/:userId', favoriteController.getFavoriteByUserId);

// Add a product to favorites
router.post('/', auth, favoriteController.addFavorite);

// Remove a product from favorites
router.delete('/:productId', auth, favoriteController.removeFavorite);

// Get the number of favorites for a product
router.get('/count/:productId', favoriteController.getFavoriteCount);

module.exports = router;
