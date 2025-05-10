const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const auth = require('../middleware/auth');

// Create new contact request (public)
router.post('/', contactController.createContact);

// Get all contact requests (admin only)
router.get('/', auth, contactController.getAllContacts);

// Update contact status (admin only)
router.put('/:id/status', auth, contactController.updateContactStatus);

// Delete contact (admin only)
router.delete('/:id', auth, contactController.deleteContact);

module.exports = router;