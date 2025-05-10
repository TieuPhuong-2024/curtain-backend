const { Post, PostView } = require('../models/post.model');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    // Extract user info from the authenticated request
    const authorId = req.user.uid;

    // Create new post with author info from Firebase authentication
    const newPost = new Post({
      ...req.body,
      authorId
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const { status, tag, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on filters
    let query = {};

    if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Lấy thông tin client
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const MIN_VIEW_INTERVAL = 5 * 60 * 1000; // 5 phút (trong milliseconds)

    try {
      // Tìm bản ghi view hiện tại
      let view = await PostView.findOne({ postId: post._id, ip });
      const now = new Date();

      if (!view) {
        // Nếu là lượt xem mới (chưa có trong 24h gần đây)
        view = new PostView({
          postId: post._id,
          ip,
          userAgent,
          lastViewedAt: now,
          viewCount: 1
        });
        await view.save();
        
        // Tăng cả hai loại view count
        post.viewCount += 1;
        post.uniqueViewCount += 1;
      } else {
        // Kiểm tra thời gian giữa các lượt xem
        const timeSinceLastView = now - view.lastViewedAt;
        
        if (timeSinceLastView >= MIN_VIEW_INTERVAL) {
          // Chỉ tăng view count nếu đã đủ thời gian
          view.viewCount += 1;
          view.lastViewedAt = now;
          await view.save();
          
          post.viewCount += 1;
        }
      }
    } catch (viewError) {
      console.error('Error processing view:', viewError);
      // Vẫn trả về bài viết ngay cả khi có lỗi xử lý view
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.authorId !== req.user.uid) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.authorId !== req.user.uid) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};