import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  'uploads/newsletter-images',
  'uploads/temp'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for newsletter images
const newsletterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/newsletter-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `newsletter-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for newsletter images
export const uploadNewsletterImage = multer({
  storage: newsletterStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  },
  fileFilter: imageFilter
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  
  next(error);
};

// Utility function to clean up old uploaded files
export const cleanupOldFiles = (directory, maxAge = 7 * 24 * 60 * 60 * 1000) => { // 7 days
  fs.readdir(directory, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        const now = Date.now();
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log(`Cleaned up old file: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Schedule cleanup every 24 hours
setInterval(() => {
  cleanupOldFiles('uploads/newsletter-images');
  cleanupOldFiles('uploads/temp');
}, 24 * 60 * 60 * 1000);