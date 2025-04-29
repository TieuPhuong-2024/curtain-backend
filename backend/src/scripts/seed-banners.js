const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Banner = require('../models/banner.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/curtainapp';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Delete existing banners
    await Banner.deleteMany({});
    console.log('Deleted existing banners');
    
    // Create sample banners
    const banners = [
      {
        title: 'Rèm Cửa Cao Cấp Cho Không Gian Của Bạn',
        description: 'Khám phá bộ sưu tập rèm cửa đa dạng với chất lượng tốt nhất và giá cả hợp lý',
        image: '/images/hero-curtain.jpg',
        link: '/products',
        isActive: true,
        order: 1
      },
      {
        title: 'Giảm Giá 20% Cho Tất Cả Rèm Chống Nắng',
        description: 'Ưu đãi đặc biệt trong tháng này - Đặt hàng ngay hôm nay!',
        image: '/images/blackout-curtains.jpg',
        link: '/products?category=Blackout',
        isActive: true,
        order: 2
      },
      {
        title: 'Dịch Vụ Tư Vấn & Lắp Đặt Miễn Phí',
        description: 'Đội ngũ chuyên nghiệp, tận tâm sẽ giúp bạn lựa chọn và lắp đặt rèm cửa hoàn hảo',
        image: '/images/living-room-curtains.jpg',
        link: '/contact',
        isActive: true,
        order: 3
      }
    ];
    
    await Banner.insertMany(banners);
    console.log('Added sample banners');
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
