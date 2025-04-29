const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');

// Lấy tất cả hình ảnh của một sản phẩm
router.get('/curtain/:curtainId', imageController.getImagesByCurtainId);

// Thêm hình ảnh cho sản phẩm
router.post('/curtain/:curtainId', imageController.addImageToCurtain);

// Cập nhật thông tin hình ảnh
router.put('/:imageId', imageController.updateImage);

// Xóa hình ảnh
router.delete('/:imageId', imageController.deleteImage);

module.exports = router; 