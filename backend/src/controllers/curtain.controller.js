const Curtain = require('../models/curtain.model');
const Image = require('../models/image.model');
const Color = require('../models/color.model');

// Get all curtains
exports.getAllCurtains = async (req, res) => {
  try {
    const curtains = await Curtain.find().populate('category').populate('color');
    res.status(200).json(curtains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single curtain with images
exports.getCurtainById = async (req, res) => {
  try {
    const curtain = await Curtain.findById(req.params.id)
      .populate('category')
      .populate('images')
      .populate('color');
    
    if (!curtain) {
      return res.status(404).json({ message: 'Curtain not found' });
    }
    
    res.status(200).json(curtain);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new curtain
exports.createCurtain = async (req, res) => {
  try {
    // Lưu trữ hình ảnh chính từ request
    const mainImage = req.body.mainImage || req.body.image; // Hỗ trợ cả 2 trường
    
    if (!mainImage) {
      return res.status(400).json({ message: 'Main image is required' });
    }

    // Tạo curtain mới với mainImage
    const curtainData = {
      ...req.body,
      mainImage: mainImage
    };
    
    // Xóa trường image cũ nếu có (để tránh lỗi)
    if (curtainData.image) delete curtainData.image;
    
    const newCurtain = new Curtain(curtainData);
    const savedCurtain = await newCurtain.save();

    // Tạo đối tượng Image cho hình ảnh chính
    const mainImageObj = new Image({
      url: mainImage,
      curtain: savedCurtain._id,
      isMain: true
    });
    
    await mainImageObj.save();

    // Thêm các hình ảnh phụ nếu có
    if (req.body.additionalImages && Array.isArray(req.body.additionalImages)) {
      const imagePromises = req.body.additionalImages.map(imageUrl => {
        const image = new Image({
          url: imageUrl,
          curtain: savedCurtain._id,
          isMain: false
        });
        return image.save();
      });

      await Promise.all(imagePromises);
    }

    // Lấy curtain vừa tạo với tất cả hình ảnh
    const curtainWithImages = await Curtain.findById(savedCurtain._id)
      .populate('category')
      .populate('images');

    res.status(201).json(curtainWithImages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a curtain
exports.updateCurtain = async (req, res) => {
  try {
    const curtainData = { ...req.body };
    
    // Chuyển đổi trường image thành mainImage nếu cần
    if (curtainData.image && !curtainData.mainImage) {
      curtainData.mainImage = curtainData.image;
      delete curtainData.image;
    }

    const updatedCurtain = await Curtain.findByIdAndUpdate(
      req.params.id,
      curtainData,
      { new: true, runValidators: true }
    );
    
    if (!updatedCurtain) {
      return res.status(404).json({ message: 'Curtain not found' });
    }

    // Cập nhật trạng thái isMain của hình ảnh chính nếu mainImage thay đổi
    if (curtainData.mainImage) {
      // Đặt tất cả hình ảnh về isMain = false
      await Image.updateMany(
        { curtain: req.params.id },
        { isMain: false }
      );

      // Tìm hình ảnh có URL trùng với mainImage để cập nhật isMain
      const mainImage = await Image.findOne({ 
        curtain: req.params.id, 
        url: curtainData.mainImage 
      });

      // Nếu đã tồn tại hình ảnh, cập nhật thành isMain
      if (mainImage) {
        mainImage.isMain = true;
        await mainImage.save();
      } else {
        // Nếu không tìm thấy, tạo hình ảnh mới
        const newMainImage = new Image({
          url: curtainData.mainImage,
          curtain: req.params.id,
          isMain: true
        });
        await newMainImage.save();
      }
    }
    
    // Lấy curtain đã cập nhật với tất cả hình ảnh
    const curtainWithImages = await Curtain.findById(req.params.id)
      .populate('category')
      .populate('images')
      .populate('color');
    
    res.status(200).json(curtainWithImages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a curtain
exports.deleteCurtain = async (req, res) => {
  try {
    const curtain = await Curtain.findById(req.params.id);
    
    if (!curtain) {
      return res.status(404).json({ message: 'Curtain not found' });
    }
    
    // Xóa tất cả hình ảnh liên quan
    await Image.deleteMany({ curtain: req.params.id });
    
    // Xóa curtain
    await Curtain.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Curtain deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 