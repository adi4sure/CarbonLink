import mongoose from 'mongoose';

const creditSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Credit amount is required'],
    min: [0, 'Amount must be positive'],
  },
  type: {
    type: String,
    enum: ['earned', 'purchased', 'transferred', 'sold'],
    required: true,
  },
  source: {
    type: String,
    enum: [
      'tree_planting',
      'solar_energy',
      'sustainable_farming',
      'composting',
      'reforestation',
      'renewable_energy',
      'marketplace',
      'transfer',
    ],
    required: true,
  },
  ecoAction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcoAction',
  },
  txHash: {
    type: String,
    unique: true,
    sparse: true,
  },
  co2Offset: {
    type: Number,
    default: 0,
  },
  metadata: {
    description: String,
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    marketplaceListingId: String,
    pricePerUnit: Number,
  },
  status: {
    type: String,
    enum: ['active', 'locked', 'expired', 'transferred'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Indexes for analytics queries
creditSchema.index({ owner: 1, type: 1 });
creditSchema.index({ source: 1, createdAt: -1 });
creditSchema.index({ status: 1 });

// Static method: get user balance
creditSchema.statics.getBalance = async function (userId) {
  const result = await this.aggregate([
    { $match: { owner: userId, status: 'active' } },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: { $cond: [{ $in: ['$type', ['earned', 'purchased']] }, '$amount', 0] },
        },
        totalSpent: {
          $sum: { $cond: [{ $in: ['$type', ['sold', 'transferred']] }, '$amount', 0] },
        },
      },
    },
  ]);
  if (!result.length) return { balance: 0, totalEarned: 0, totalSpent: 0 };
  const { totalEarned, totalSpent } = result[0];
  return { balance: totalEarned - totalSpent, totalEarned, totalSpent };
};

export default mongoose.model('Credit', creditSchema);
