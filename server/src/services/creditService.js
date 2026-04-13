import { Credit, Transaction } from '../models/Credit.js';
import User from '../models/User.js';
import { generateTxHash } from '../utils/hashGenerator.js';
import { co2ToCredits } from '../utils/co2Calculator.js';

/**
 * Mint new CLC credits for an approved eco-action
 */
export async function mintCredits(ecoAction, userId) {
  const amount = co2ToCredits(ecoAction.co2Estimate);
  const txHash = generateTxHash();

  const credit = await Credit.create({
    owner: userId,
    amount,
    sourceAction: ecoAction._id,
    txHash,
    status: 'active',
  });

  const transaction = await Transaction.create({
    type: 'mint',
    to: userId,
    amount,
    txHash,
  });

  await User.findByIdAndUpdate(userId, {
    $inc: {
      creditBalance: amount,
      totalCo2Offset: ecoAction.co2Estimate,
    },
  });

  return { credit, transaction };
}

/**
 * Transfer credits between users
 */
export async function transferCredits(fromUserId, toUserId, amount) {
  const sender = await User.findById(fromUserId);
  if (!sender || sender.creditBalance < amount) {
    throw new Error('Insufficient credit balance');
  }

  const txHash = generateTxHash();

  const transaction = await Transaction.create({
    type: 'transfer',
    from: fromUserId,
    to: toUserId,
    amount,
    txHash,
  });

  await User.findByIdAndUpdate(fromUserId, { $inc: { creditBalance: -amount } });
  await User.findByIdAndUpdate(toUserId, { $inc: { creditBalance: amount } });

  const credits = await Credit.find({ owner: fromUserId, status: 'active' });
  let remaining = amount;
  for (const credit of credits) {
    if (remaining <= 0) break;
    if (credit.amount <= remaining) {
      credit.owner = toUserId;
      credit.status = 'transferred';
      await credit.save();
      remaining -= credit.amount;
    }
  }

  return transaction;
}

/**
 * Get user's credit balance and summary
 */
export async function getUserCreditSummary(userId) {
  const user = await User.findById(userId);
  const activeCredits = await Credit.countDocuments({ owner: userId, status: 'active' });
  const listedCredits = await Credit.countDocuments({ owner: userId, status: 'listed' });

  // Simple sum instead of aggregate
  const allCredits = await Credit.find({ owner: userId });
  const totalMinted = allCredits.reduce((sum, c) => sum + (c.amount || 0), 0);

  return {
    balance: user?.creditBalance || 0,
    activeCredits,
    listedCredits,
    totalMinted,
    totalCo2Offset: user?.totalCo2Offset || 0,
    totalEarnings: user?.totalEarnings || 0,
  };
}
