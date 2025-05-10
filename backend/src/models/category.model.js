const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: '/images/curtain-placeholder.jpg'
    }
}, {timestamps: true});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
