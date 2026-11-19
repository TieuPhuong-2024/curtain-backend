const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth');

// Public read-only routes
router.get('/', projectController.getAllProjects);
router.get('/type/:type', projectController.getProjectsByType);
router.get('/:id', projectController.getProjectById);

// Protected routes - require authentication
router.post('/', auth, projectController.createProject);
router.put('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router; 