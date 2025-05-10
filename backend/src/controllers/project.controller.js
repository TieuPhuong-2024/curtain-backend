const Project = require('../models/project.model');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    // Chỉ lấy các trường cần thiết từ request body
    const { title, shortDescription, detailedContent, location, type, thumbnail, featured, published } = req.body;
    
    const projectData = {
      title,
      shortDescription,
      detailedContent,
      location,
      type,
      thumbnail,
      featured: featured || false,
      published: published !== undefined ? published : true
    };
    
    const newProject = new Project(projectData);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get projects by type
exports.getProjectsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const projects = await Project.find({ type }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    // Chỉ lấy các trường cần thiết từ request body
    const { title, shortDescription, detailedContent, location, type, thumbnail, featured, published } = req.body;
    
    const projectData = {
      title,
      shortDescription,
      detailedContent,
      location,
      type,
      thumbnail,
      featured: featured || false,
      published: published !== undefined ? published : true,
      updatedAt: Date.now()
    };
    
    // Chỉ cập nhật các trường được gửi lên (không undefined)
    const updateData = Object.fromEntries(
      Object.entries(projectData).filter(([_, value]) => value !== undefined)
    );
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 