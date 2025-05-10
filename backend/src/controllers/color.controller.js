const Color = require('../models/color.model');

// Get all colors
exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.find().sort({ name: 1 }); // Sort by name
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Optional: Create a new color (if you want to manage colors via API)
exports.createColor = async (req, res) => {
  const { name, hexCode } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Color name is required.' });
  }
  try {
    const existingColor = await Color.findOne({ name });
    if (existingColor) {
      return res.status(400).json({ message: 'Color with this name already exists.' });
    }
    const newColor = new Color({ name, hexCode });
    const savedColor = await newColor.save();
    res.status(201).json(savedColor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a color by ID
exports.updateColor = async (req, res) => {
  const { id } = req.params;
  const { name, hexCode } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Color name is required.' });
  }
  
  try {
    // Check if color exists
    const color = await Color.findById(id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found.' });
    }
    
    // Check if new name already exists (if the name is being changed)
    if (name !== color.name) {
      const existingColor = await Color.findOne({ name });
      if (existingColor) {
        return res.status(400).json({ message: 'Color with this name already exists.' });
      }
    }
    
    // Update color
    const updatedColor = await Color.findByIdAndUpdate(
      id, 
      { name, hexCode: hexCode || '#808080' }, // Default to gray if no HEX is provided
      { new: true }
    );
    
    res.status(200).json(updatedColor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a color by ID
exports.getColorById = async (req, res) => {
  const { id } = req.params;
  try {
    const color = await Color.findById(id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found.' });
    }
    res.status(200).json(color);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add other CRUD operations (deleteColor) as needed.
