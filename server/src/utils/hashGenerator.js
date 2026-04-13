import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Generate a mock IPFS-like content hash (CID)
 * In production, this would use actual IPFS pinning (Pinata/Infura)
 */
export function generateIpfsHash(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = crypto.createHash('sha256').update(content + Date.now()).digest('hex');
  // Simulate a CIDv1 format: bafy... prefix
  return `bafybeig${hash.slice(0, 50)}`;
}

/**
 * Generate a mock blockchain transaction hash
 * Format: 0x followed by 64 hex characters (like Ethereum tx hash)
 */
export function generateTxHash() {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `0x${randomBytes}`;
}

/**
 * Generate a unique token ID
 */
export function generateTokenId() {
  return `CLC-${uuidv4().slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}
