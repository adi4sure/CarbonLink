import mongoose from 'mongoose';

const ecoActionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: [true, 'Action type is required'],
    enum: [
      'tree_planting',
      'solar_energy',
      'sustainable_farming',
      'composting',
      'reforestation',
      'renewable_energy',
      'water_conservation',
      'waste_reduction',
    ],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity must be positive'],
  },
  unit: {
    type: String,
    required: true,
  },
  co2Offset: {
    type: Number,
    required: true,
    min: [0, 'CO₂ offset must be positive'],
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationHash: {
    type: String,
  },
  proofImages: [{
    type: String,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
    address: String,
  },
  creditsEarned: {
    type: Number,
    default: 0,
  },
  verifiedAt: {
    type: Date,
  },
  verifiedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
ecoActionSchema.index({ user: 1, status: 1 });
ecoActionSchema.index({ type: 1, co2Offset: -1 });

export default mongoose.model('EcoAction', ecoActionSchema);
