const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String
  },
  mimetype: {
    type: String,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  },
  size: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for accessing file as URL
fileSchema.virtual('fileUrl').get(function() {
  return `/api/files/${this._id}`;
});

fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

const File = mongoose.model('File', fileSchema);

module.exports = File; 