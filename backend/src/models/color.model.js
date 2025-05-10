const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true // Assuming color names should be unique
  },
  hexCode: {
    type: String,
    trim: true,
    // You might want to add validation for hex code format if needed
  },
  // You can add other fields like a description if necessary
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;
