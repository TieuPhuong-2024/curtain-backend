const File = require('../models/file.model');

// Get file by ID and serve it
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Set the appropriate content type
    res.set('Content-Type', file.mimetype);
    
    // Send the file data
    res.send(file.data);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file', error: error.message });
  }
};

// Save a file to the database
exports.saveFile = async (fileData) => {
  try {
    const newFile = new File(fileData);
    const savedFile = await newFile.save();
    return savedFile;
  } catch (error) {
    console.error('Error saving file to database:', error);
    throw error;
  }
}; 