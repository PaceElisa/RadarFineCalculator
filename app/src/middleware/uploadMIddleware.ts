/**
 *  Multer Node.js middleware for handling multipart/form-data used for uploading files like images.
 */

import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';


dotenv.config();

const uploadPath = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'upload');

//Define a storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);//Rename the file with a timestamp
  }
});

// Initialize multer with storage configuration
export const upload = multer({ storage: storage });