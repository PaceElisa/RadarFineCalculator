import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

const uploadPath = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'upload');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // cartella dove salvare le immagini
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage: storage });