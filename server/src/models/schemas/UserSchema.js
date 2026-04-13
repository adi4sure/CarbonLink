import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['eco_actor', 'buyer', 'admin'],
    default: 'eco_actor',
  },
  avatar: {
    type: String,
    default: '',
  },
  googleId: {
    type: String,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  carbonCredits: {
    type: Number,
    default: 0,
  },
  totalCO2Offset: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastActionDate: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for credit count
userSchema.virtual('creditCount', {
  ref: 'Credit',
  localField: '_id',
  foreignField: 'owner',
  count: true,
});

export default mongoose.model('User', userSchema);
