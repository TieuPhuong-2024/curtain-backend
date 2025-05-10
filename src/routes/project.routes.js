const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');

// CRUD routes for projects
router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/type/:type', projectController.getProjectsByType);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router; 