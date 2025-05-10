const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileController = require('./file.controller');

// Configure in-memory storage for uploaded files
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

// Configure multer for images
const uploadImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Configure multer for videos
const uploadVideo = multer({
    storage: storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload image from device and save to database
exports.uploadImage = (req, res) => {
  // The upload middleware will handle the file
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: 'Unknown error', error: err.message });
    }

    // Everything went fine, a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Prepare file data for database
      const fileData = {
        filename: Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname),
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        data: req.file.buffer,
        size: req.file.size
      };

      // Save file to database
      const savedFile = await fileController.saveFile(fileData);

      // Return the URL for accessing the file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}${savedFile.fileUrl}`;

      res.status(200).json({
        message: 'File uploaded successfully',
        url: fileUrl,
        fileId: savedFile._id
      });
    } catch (error) {
      console.error('Error saving file to database:', error);
      res.status(500).json({ message: 'Error saving file', error: error.message });
    }
  });
};

// Upload multiple images at once
exports.uploadMultipleImages = (req, res) => {
  const uploadMultiple = upload.array('images', 10); // Allow up to 10 images

  uploadMultiple(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'Unknown error', error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
      const savedFiles = await Promise.all(req.files.map(async (file) => {
        // Prepare file data for database
        const fileData = {
          filename: Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname),
          originalname: file.originalname,
          mimetype: file.mimetype,
          data: file.buffer,
          size: file.size
        };

        // Save file to database
        const savedFile = await fileController.saveFile(fileData);
        
        // Prepare URL for accessing the file
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}${savedFile.fileUrl}`;
      }));

      res.status(200).json({
        message: 'Files uploaded successfully',
        urls: savedFiles
      });
    } catch (error) {
      console.error('Error saving files to database:', error);
      res.status(500).json({ message: 'Error saving files', error: error.message });
    }
  });
};

// Save image from URL (cloud)
exports.saveImageFromUrl = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Return the provided URL (external URL)
    res.status(200).json({
      message: 'URL saved successfully',
      url: imageUrl
    });
  } catch (error) {
    console.error('Error saving image from URL:', error);
    res.status(500).json({ message: 'Error saving image from URL', error: error.message });
  }
};

// Save multiple image URLs at once
exports.saveMultipleImageUrls = async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ message: 'Image URLs are required as an array' });
    }

    // Validate URL formats
    for (const url of imageUrls) {
      try {
        new URL(url);
      } catch (err) {
        return res.status(400).json({ message: `Invalid URL format: ${url}` });
      }
    }

    // Return the provided URLs
    res.status(200).json({
      message: 'URLs saved successfully',
      urls: imageUrls
    });
  } catch (error) {
    console.error('Error saving image URLs:', error);
    res.status(500).json({ message: 'Error saving image URLs', error: error.message });
  }
};

// Upload video from device and save to database
exports.uploadVideo = (req, res) => {
    const uploadSingle = uploadVideo.single('video');

    uploadSingle(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'File upload error', error: err.message });
        } else if (err) {
            return res.status(500).json({ message: 'Unknown error', error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const fileData = {
                filename: Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname),
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                data: req.file.buffer,
                size: req.file.size
            };

            const savedFile = await fileController.saveFile(fileData);
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const fileUrl = `${baseUrl}${savedFile.fileUrl}`;

            res.status(200).json({
                message: 'Video uploaded successfully',
                url: fileUrl,
                fileId: savedFile._id
            });
        } catch (error) {
            console.error('Error saving video to database:', error);
            res.status(500).json({ message: 'Error saving video', error: error.message });
        }
    });
};