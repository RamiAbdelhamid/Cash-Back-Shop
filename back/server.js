import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import { getCashbackBalance } from './controllers/customerController.js';

dotenv.config();
const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/purchases', purchaseRoutes);

// Public route for cashback inquiry (no authentication required)
app.get('/api/cashback/inquiry', getCashbackBalance);

// Serve static files from React build
const reactBuildPath = path.join(__dirname, '../Shop/dist');
app.use(express.static(reactBuildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(reactBuildPath, 'index.html');
  console.log('Looking for React build at:', reactBuildPath);
  console.log('Looking for index.html at:', indexPath);
  
  // Check if the file exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('React build not found. Please build the React app first.');
    res.status(404).json({ 
      error: 'React build not found. Please build the React app first.',
      path: indexPath
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File too large. Maximum size is 5MB.' 
      });
    }
  }
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!' 
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hasan-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));