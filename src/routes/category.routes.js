const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getCategories);

// POST create a new category
router.post('/', auth, categoryController.createCategory);

// PUT update a category
router.put('/:id', auth, categoryController.updateCategory);

// DELETE a category
router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router;
