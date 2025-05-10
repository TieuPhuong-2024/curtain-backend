const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getCategories);

// POST create a new category
router.post('/', categoryController.createCategory);

// PUT update a category
router.put('/:id', categoryController.updateCategory);

// DELETE a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
