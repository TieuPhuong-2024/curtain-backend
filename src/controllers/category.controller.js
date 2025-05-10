const Category = require("../models/category.model");

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({message: 'Không thể lấy danh mục sản phẩm', error: error.message});
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(500).json({message: 'Không thể tạo danh mục sản phẩm', error: error.message});
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({message: 'Không thể cập nhật danh mục sản phẩm', error: error.message});
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({message: 'Category not found'});
        }

        res.status(200).json({message: 'Category deleted successfully'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

