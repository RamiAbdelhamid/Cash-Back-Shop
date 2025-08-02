// 📁 File: routes/authRoutes.js
import express from 'express';
import multer from 'multer';
import { register, login, verifyToken, getProfile, getAllStores } from '../controllers/authController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.get('/stores', getAllStores); // Route for getting all stores

// Protected routes (require JWT token)
router.get('/profile', verifyToken, getProfile);

export default router;