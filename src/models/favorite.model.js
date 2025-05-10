const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Curtain', required: true },
}, { timestamps: true });

favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
