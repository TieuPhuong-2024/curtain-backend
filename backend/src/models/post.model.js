const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema để lưu trữ lượt xem
const postViewSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Post'
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  },
  viewCount: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 86400 // Tự động xóa sau 24h
  }
});

// Index để tìm kiếm nhanh và đảm bảo unique trong 24h
postViewSchema.index({ postId: 1, ip: 1 }, { unique: true, expires: "24h" });

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: Object,
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  authorId: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  uniqueViewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Tạo models
const PostView = mongoose.model('PostView', postViewSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = { Post, PostView };