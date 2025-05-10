const Banner = require('../models/banner.model');

// Get all active banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
};

// Get a single banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json(banner);
  } catch (error) {
    console.error(`Error fetching banner with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching banner', error: error.message });
  }
};

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
};

// Update a banner
exports.updateBanner = async (req, res) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json(updatedBanner);
  } catch (error) {
    console.error(`Error updating banner with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    if (!deletedBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error(`Error deleting banner with id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
};
