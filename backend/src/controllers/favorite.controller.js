const Favorite = require('../models/favorite.model');
const Curtain = require('../models/curtain.model');

exports.getFavoriteByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({ user: userId })
      .populate('product')
      .lean();
    const transformedData = favorites.map(fav => ({
      _id: fav._id, // Trả về _id của favorite document
      productId: fav.product._id, // Thêm productId để phân biệt
      product: fav.product, // Giữ nguyên thông tin product
      createdAt: fav.createdAt
    }));
    res.json({ success: true, data: transformedData });
  } catch (err) {
    console.error('Error in getFavoriteByUserId:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all favorite products for a user
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from auth middleware

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name' }
      })
      .lean();

    const transformedData = favorites.map(fav => ({
      _id: fav.product._id,
      ...fav.product,
      favoriteId: fav._id,
      createdAt: fav.createdAt,
      categoryName: fav.product.category?.name // Include category name
    }));

    res.json({ success: true, data: transformedData });
  } catch (err) {
    console.error('Error in getFavorites:', err); // Debug log
    res.status(500).json({ error: err.message });
  }
};

// Add product to favorites
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user._id; // Using _id from auth middleware
    const { productId } = req.body;

    console.log('Adding favorite for user:', userId, 'product:', productId); // Debug log

    // Check if product exists
    const product = await Curtain.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create new favorite
    const favorite = new Favorite({
      user: userId,
      product: productId
    });

    // Save to database
    await favorite.save();
    console.log('Favorite saved:', favorite); // Debug log

    res.json({ success: true, data: favorite });
  } catch (err) {
    console.error('Error in addFavorite:', err); // Debug log
    // Check if error is a duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Remove product from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user._id; // Using _id from auth middleware
    const { productId } = req.params;

    console.log('Removing favorite for user:', userId, 'product:', productId); // Debug log

    const result = await Favorite.findOneAndDelete({ user: userId, product: productId });
    if (!result) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in removeFavorite:', err); // Debug log
    res.status(500).json({ error: err.message });
  }
};

// Get favorite count for a product
exports.getFavoriteCount = async (req, res) => {
  try {
    const { productId } = req.params;
    const count = await Favorite.countDocuments({ product: productId });
    res.json({ success: true, data: { productId, count } });
  } catch (err) {
    console.error('Error in getFavoriteCount:', err); // Debug log
    res.status(500).json({ error: err.message });
  }
};
