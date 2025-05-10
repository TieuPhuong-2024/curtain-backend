const mongoose = require('mongoose');

const curtainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  material: {
    type: String,
    required: true
  },
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true
  },
  size: {
    width: {
      type: Number,
      required: true,
      min: 0
    },
    height: {
      type: Number,
      required: true,
      min: 0
    }
  },
  mainImage: {
    type: String,
    required: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ảo hóa để tự động lấy tất cả hình ảnh liên quan
curtainSchema.virtual('images', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'curtain'
});

const Curtain = mongoose.model('Curtain', curtainSchema);

module.exports = Curtain; 