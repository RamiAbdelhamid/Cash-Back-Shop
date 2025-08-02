import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: false,
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cashbackBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
customerSchema.index({ storeId: 1, phoneNumber: 1 });

export default mongoose.model('Customer', customerSchema); 