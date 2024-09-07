/**
 *  Multer Node.js middleware for handling multipart/form-data used for uploading files like images.
 */

import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';


dotenv.config();

const uploadPath = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'images');
console.log(uploadPath);

// Ensure the directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`Created directory: ${uploadPath}`);
}

//Define a storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);//Rename the file with a timestamp
  }
});

// Initialize multer with storage configuration
export const upload = multer({ storage: storage });
