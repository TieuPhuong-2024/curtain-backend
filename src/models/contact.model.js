const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    phone: {
        type: String,
        required: true,
        match: [/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ']
    },
    subject: {
        type: String
    },
    message: {
        type: String,
        required: true,
        minLength: [10, 'Nội dung tin nhắn quá ngắn'],
        maxLength: [1000, 'Nội dung tin nhắn quá dài']
    },
    status: {
        type: String,
        enum: ['new', 'processing', 'completed'],
        default: 'new'
    },
    ipAddress: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', contactSchema);