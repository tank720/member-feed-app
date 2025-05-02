import multer from 'multer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../profile_photos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'), false);
  }
};

// Configure multer upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to download image from URL
export const downloadImage = async (url) => {
  return new Promise((resolve, reject) => {
    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      reject(new Error('Invalid URL'));
      return;
    }

    // Choose protocol based on URL
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      // Check if response is an image
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        reject(new Error('URL does not point to an image'));
        return;
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(url) || '.jpg'; // Default to .jpg if no extension
      const filename = uniqueSuffix + ext;

      // Create write stream
      const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../profile_photos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filepath = path.join(uploadDir, filename);
      const fileStream = fs.createWriteStream(filepath);

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        resolve(filename);
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};