import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purchaseAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  cashbackAmount: {
    type: Number,
    required: true,
    min: 0
  },
  cashbackPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
purchaseSchema.index({ customerId: 1, storeId: 1, purchaseDate: -1 });

export default mongoose.model('Purchase', purchaseSchema); 