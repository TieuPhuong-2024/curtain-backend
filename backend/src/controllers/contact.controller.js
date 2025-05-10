const Contact = require('../models/contact.model');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Rate limit check function
const isRateLimited = async (ipAddress) => {
    const lastMinute = new Date(Date.now() - 60 * 1000); // 1 minute ago
    const lastHour = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    const minuteCount = await Contact.countDocuments({
        ipAddress,
        createdAt: { $gte: lastMinute }
    });
    
    const hourCount = await Contact.countDocuments({
        ipAddress,
        createdAt: { $gte: lastHour }
    });
    
    return minuteCount >= 2 || hourCount >= 5;
};

// Create new contact request
exports.createContact = async (req, res) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        
        // Check rate limiting
        const limited = await isRateLimited(ipAddress);
        if (limited) {
            return res.status(429).json({
                success: false,
                message: 'Vui lòng đợi một lát trước khi gửi yêu cầu mới'
            });
        }

        // Check for spam indicators
        const { name, email, phone, message } = req.body;
        
        // Simple spam checks
        if (message.includes('http://') || message.includes('https://')) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung không được chứa liên kết'
            });
        }

        if (message.toLowerCase().includes('spam') || 
            message.toLowerCase().includes('marketing') ||
            message.toLowerCase().includes('seo')) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung không hợp lệ'
            });
        }

        const contact = new Contact({
            ...req.body,
            ipAddress
        });
        
        await contact.save();

        // Send email notification
        const mailOptions = {
            from: contact.email,
            to: process.env.EMAIL_USER,
            subject: 'Yêu cầu tư vấn mới',
            html: `
                <h2>Có yêu cầu tư vấn mới từ khách hàng</h2>
                <p><strong>Họ và tên:</strong> ${contact.name}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Số điện thoại:</strong> ${contact.phone}</p>
                <p><strong>Chủ đề:</strong> ${contact.subject || 'Không có'}</p>
                <p><strong>Nội dung:</strong> ${contact.message}</p>
                <p><strong>Thời gian gửi:</strong> ${new Date(contact.createdAt).toLocaleString('vi-VN')}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: 'Yêu cầu tư vấn đã được gửi thành công',
            data: contact
        });
    } catch (error) {
        console.error('Error in createContact:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Không thể gửi yêu cầu tư vấn',
        });
    }
};

// Get all contact requests (for admin)
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách yêu cầu tư vấn',
            error: error.message
        });
    }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu tư vấn'
            });
        }
        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái',
            error: error.message
        });
    }
};

// Delete contact
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu tư vấn'
            });
        }
        
        res.json({
            success: true,
            message: 'Xóa yêu cầu tư vấn thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Không thể xóa yêu cầu tư vấn',
            error: error.message
        });
    }
};