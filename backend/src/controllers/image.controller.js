const Image = require('../models/image.model');
const Curtain = require('../models/curtain.model');

// Lấy tất cả hình ảnh của một sản phẩm
exports.getImagesByCurtainId = async (req, res) => {
  try {
    const images = await Image.find({ curtain: req.params.curtainId });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm hình ảnh cho sản phẩm
exports.addImageToCurtain = async (req, res) => {
  try {
    // Kiểm tra sản phẩm tồn tại
    const curtain = await Curtain.findById(req.params.curtainId);
    if (!curtain) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Nếu đánh dấu là hình ảnh chính, cập nhật mainImage của Curtain
    if (req.body.isMain) {
      // Đặt tất cả hình ảnh hiện tại của sản phẩm này thành không phải hình ảnh chính
      await Image.updateMany(
        { curtain: req.params.curtainId },
        { isMain: false }
      );

      // Cập nhật mainImage của Curtain
      curtain.mainImage = req.body.url;
      await curtain.save();
    }

    // Tạo hình ảnh mới
    const newImage = new Image({
      url: req.body.url,
      curtain: req.params.curtainId,
      isMain: req.body.isMain || false
    });

    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin hình ảnh
exports.updateImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Hình ảnh không tồn tại' });
    }

    // Nếu đánh dấu là hình ảnh chính và chưa phải là hình ảnh chính trước đó
    if (req.body.isMain && !image.isMain) {
      // Đặt tất cả hình ảnh hiện tại của sản phẩm này thành không phải hình ảnh chính
      await Image.updateMany(
        { curtain: image.curtain },
        { isMain: false }
      );

      // Cập nhật mainImage của Curtain
      const curtain = await Curtain.findById(image.curtain);
      if (curtain) {
        curtain.mainImage = image.url;
        await curtain.save();
      }
    }

    // Cập nhật thông tin hình ảnh
    const updatedImage = await Image.findByIdAndUpdate(
      req.params.imageId,
      { ...req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa hình ảnh
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Hình ảnh không tồn tại' });
    }

    // Kiểm tra nếu đây là hình ảnh chính, không cho phép xóa nếu là hình ảnh duy nhất
    if (image.isMain) {
      const imagesCount = await Image.countDocuments({ curtain: image.curtain });
      if (imagesCount <= 1) {
        return res.status(400).json({ 
          message: 'Không thể xóa hình ảnh chính duy nhất của sản phẩm'
        });
      }

      // Nếu không phải hình ảnh duy nhất, chọn hình ảnh khác làm hình ảnh chính
      const anotherImage = await Image.findOne({ 
        curtain: image.curtain, 
        _id: { $ne: req.params.imageId } 
      });

      if (anotherImage) {
        anotherImage.isMain = true;
        await anotherImage.save();

        // Cập nhật mainImage của Curtain
        const curtain = await Curtain.findById(image.curtain);
        if (curtain) {
          curtain.mainImage = anotherImage.url;
          await curtain.save();
        }
      }
    }

    await Image.findByIdAndDelete(req.params.imageId);
    res.status(200).json({ message: 'Xóa hình ảnh thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 